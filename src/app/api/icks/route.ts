// src/app/api/icks/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { analyzeIck } from "@/lib/ai-analysis";

const prisma = new PrismaClient();

// Define runtime types for analytics
type SentimentItem = { sentiment: string; _count: { sentiment: number } };
type CategoryItem = { category: string; _count: { category: number } };
type UserTypeItem = { user_type: string; _count: { user_type: number } };

// GET all icks with optional filtering
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const category = searchParams.get("category");
    const sentiment = searchParams.get("sentiment");
    const minSeverity = searchParams.get("min_severity");
    const minOpportunity = searchParams.get("min_opportunity");
    const userType = searchParams.get("user_type");

    const where: any = {};

    if (category) where.category = category;
    if (sentiment) where.sentiment = sentiment;
    if (minSeverity) where.severity = { gte: parseInt(minSeverity, 10) };
    if (minOpportunity)
      where.opportunity_score = { gte: parseInt(minOpportunity, 10) };
    if (userType) where.user_type = userType;

    // Add database connection check
    await prisma.$connect();
    
    const icks = await prisma.Ick.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit, 10) : undefined,
    });
    
    // Ensure we always return an array
    const safeIcks = Array.isArray(icks) ? icks : [];
      
    return NextResponse.json(safeIcks);
  } catch (error: unknown) {
    console.error("Error fetching icks:", error);
    
    // Return empty array instead of error to prevent frontend crashes
    return NextResponse.json([], { status: 200 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST a new ick with AI analysis
export async function POST(req: Request) {
  console.log("🔍 Environment check:", {
    hasGemini: !!process.env.GEMINI_API_KEY,
  });
  try {
    // Add request body validation
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { content, tags: userTags, user_type = "venter" } = body;

    // Enhanced validation
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content must be a string" },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length < 3) {
      return NextResponse.json(
        { error: "Ick must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: "Ick must be less than 500 characters" },
        { status: 400 }
      );
    }

    // Validate user_type
    const validUserTypes = ["venter", "hunter", "both"];
    if (!validUserTypes.includes(user_type)) {
      return NextResponse.json(
        { error: "Invalid user_type. Must be 'venter', 'hunter', or 'both'" },
        { status: 400 }
      );
    }

    await prisma.$connect();

    // Duplicate detection with better error handling
    const recentIck = await prisma.Ick.findFirst({
      where: {
        content: trimmedContent,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
    });

    if (recentIck) {
      return NextResponse.json(
        { error: "Duplicate ick detected. Please wait before submitting again." },
        { status: 429 }
      );
    }

    console.log("🤖 Analyzing ick with AI...");
    
    // Add AI analysis with fallback
    let analysis;
    try {
      analysis = await analyzeIck(trimmedContent);
    } catch (aiError) {
      console.warn("AI analysis failed, using defaults:", aiError);
      analysis = {
        severity: 5,
        sentiment: "neutral",
        opportunity_score: 5,
        category: "general",
        reasoning: "Auto-generated (AI analysis unavailable)",
        tags: []
      };
    }

    // Enhanced fallback values with type checking
    const severity = (typeof analysis.severity === "number" && 
                     analysis.severity >= 1 && 
                     analysis.severity <= 10) ? analysis.severity : 5;
    
    const validSentiments = ["gross", "no way", "acceptable", "neutral"];
    const sentiment = (typeof analysis.sentiment === "string" && 
                      validSentiments.includes(analysis.sentiment)) 
                      ? analysis.sentiment : "neutral";
    
    const opportunity_score = (typeof analysis.opportunity_score === "number" && 
                              analysis.opportunity_score >= 1 && 
                              analysis.opportunity_score <= 10) 
                              ? analysis.opportunity_score : 5;
    
    const category = (typeof analysis.category === "string" && analysis.category.trim()) 
                    ? analysis.category : "general";
    
    const reasoning = (typeof analysis.reasoning === "string") 
                     ? analysis.reasoning : "No reasoning provided";
    
    const tags = Array.isArray(analysis.tags) ? analysis.tags : [];

    const combinedTags = [...(Array.isArray(userTags) ? userTags : []), ...tags];
    const uniqueTags = [...new Set(combinedTags.map(tag => String(tag)))].slice(0, 8);

    const newIck = await prisma.Ick.create({
      data: {
        content: trimmedContent,
        tags: uniqueTags,
        severity,
        sentiment,
        opportunity_score,
        category,
        reasoning,
        user_type,
        views: 0,
        upvotes: 0,
        downvotes: 0,
      },
    });

    return NextResponse.json(
      { ...newIck, analysis: { reasoning, confidence: "high" } },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("❌ Error creating Ick:", error);
    
    // Better error response
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: "This ick already exists" },
          { status: 409 }
        );
      }
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: "Database connection failed" },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: "Failed to create ick",
        details: process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PATCH analytics
export async function PATCH() {
  try {
    await prisma.$connect();
    
    const totalIcks = await prisma.Ick.count();
    const sampleIck = await prisma.Ick.findFirst();
    const hasNewFields = sampleIck && "opportunity_score" in sampleIck;

    const avgStats = await prisma.Ick.aggregate({
      _avg: {
        severity: true,
        ...(hasNewFields ? { opportunity_score: true } : {}),
      },
    });

    // Safe mapping to prevent runtime errors with better error handling
    const sentimentRaw = await prisma.Ick.groupBy({
      by: ["sentiment"],
      _count: { sentiment: true },
    });
    const sentimentBreakdown: SentimentItem[] = Array.isArray(sentimentRaw)
      ? sentimentRaw.map(item => ({
          sentiment: String(item.sentiment || 'unknown'),
          _count: { sentiment: Number(item._count?.sentiment || 0) },
        }))
      : [];

    const categoryRaw = await prisma.Ick.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    });
    const categoryBreakdown: CategoryItem[] = Array.isArray(categoryRaw)
      ? categoryRaw.map(item => ({
          category: String(item.category || 'unknown'),
          _count: { category: Number(item._count?.category || 0) },
        }))
      : [];

    const userTypeRaw = await prisma.Ick.groupBy({
      by: ["user_type"],
      _count: { user_type: true },
    });
    const userTypeBreakdown: UserTypeItem[] = Array.isArray(userTypeRaw)
      ? userTypeRaw.map(item => ({
          user_type: String(item.user_type || 'unknown'),
          _count: { user_type: Number(item._count?.user_type || 0) },
        }))
      : [];

    return NextResponse.json({
      totalIcks: Number(totalIcks || 0),
      avgStats: {
        severity: Number(avgStats._avg?.severity || 0),
        opportunity_score: Number(avgStats._avg?.opportunity_score || 0)
      },
      sentimentBreakdown,
      categoryBreakdown,
      userTypeBreakdown,
    });
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics",
        totalIcks: 0,
        avgStats: { severity: 0, opportunity_score: 0 },
        sentimentBreakdown: [],
        categoryBreakdown: [],
        userTypeBreakdown: []
      },
      { status: 200 } // Return 200 with empty data instead of 500
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT endpoint for updating ick engagement
export async function PUT(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "ID and action are required" }, { status: 400 });
    }

    // Validate ID is a number
    const numericId = parseInt(String(id), 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID must be a valid number" }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case "view":
        updateData = { views: { increment: 1 } };
        break;
      case "upvote":
        updateData = { upvotes: { increment: 1 } };
        break;
      case "downvote":
        updateData = { downvotes: { increment: 1 } };
        break;
      case "undo_upvote":
        updateData = { upvotes: { decrement: 1 } };
        break;
      case "undo_downvote":
        updateData = { downvotes: { decrement: 1 } };
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await prisma.$connect();

    const updatedIck = await prisma.Ick.update({
      where: { id: numericId },
      data: updateData,
    });

    return NextResponse.json(updatedIck);
  } catch (error) {
    console.error("❌ Error updating ick engagement:", error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: "Ick not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to update ick" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}