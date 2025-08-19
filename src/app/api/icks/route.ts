// src/app/api/icks/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { analyzeIck } from "@/lib/ai-analysis";

const prisma = new PrismaClient();

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

    const where: any = {}; // Use `any` because Prisma doesn't export IckWhereInput

    if (category) where.category = category;
    if (sentiment) where.sentiment = sentiment;
    if (minSeverity) where.severity = { gte: parseInt(minSeverity, 10) };
    if (minOpportunity)
      where.opportunity_score = { gte: parseInt(minOpportunity, 10) };
    if (userType) where.user_type = userType;

    const icks = await prisma.ick.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json(icks);
  } catch (error) {
    console.error("Error fetching icks:", error);
    return NextResponse.json({ error: "Failed to fetch icks" }, { status: 500 });
  }
}

// POST a new ick with AI analysis
export async function POST(req: Request) {
  try {
    const body: { content?: string; tags?: string[]; user_type?: string } = await req.json();
    const { content, tags: userTags, user_type = "venter" } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Content is required and must be a string" },
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

    // Duplicate detection
    const recentIck = await prisma.ick.findFirst({
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
    const analysis = await analyzeIck(trimmedContent);

    console.log("✅ AI Analysis completed:", analysis);

    const combinedTags = [...(Array.isArray(userTags) ? userTags : []), ...analysis.tags];
    const uniqueTags = [...new Set(combinedTags)].slice(0, 8);

    const newIck = await prisma.ick.create({
      data: {
        content: trimmedContent,
        tags: uniqueTags,
        severity: analysis.severity,
        sentiment: analysis.sentiment,
        opportunity_score: analysis.opportunity_score,
        category: analysis.category,
        reasoning: analysis.reasoning,
        user_type,
        views: 0,
        upvotes: 0,
        downvotes: 0,
      },
    });

    return NextResponse.json(
      { ...newIck, analysis: { reasoning: analysis.reasoning, confidence: "high" } },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) console.error("❌ Error creating Ick:", error.message);
    return NextResponse.json(
      {
        error: "Failed to analyze and create ick",
        details: process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
      },
      { status: 500 }
    );
  }
}

// PATCH (analytics)
export async function PATCH() {
  try {
    console.log("📊 Fetching analytics...");

    const totalIcks = await prisma.ick.count();
    const sampleIck = await prisma.ick.findFirst();
    const hasNewFields = sampleIck && "opportunity_score" in sampleIck;

    const avgStats = await prisma.ick.aggregate({
      _avg: {
        severity: true,
        ...(hasNewFields ? { opportunity_score: true } : {}),
      },
    });

    type SentimentItem = { sentiment: string; _count: { sentiment: number } };
    type CategoryItem = { category: string; _count: { category: number } };
    type UserTypeItem = { user_type: string; _count: { user_type: number } };

    const sentimentBreakdown: SentimentItem[] = await prisma.ick.groupBy({
      by: ["sentiment"],
      _count: { sentiment: true },
    });

    const categoryBreakdown: CategoryItem[] = await prisma.ick.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 10,
    });

    const userTypeBreakdown: UserTypeItem[] = await prisma.ick.groupBy({
      by: ["user_type"],
      _count: { user_type: true },
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTrends = await prisma.ick.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: {
        id: true,
        category: true,
        sentiment: true,
        severity: true,
        opportunity_score: true,
        createdAt: true,
        content: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.ick.count({
      where: { createdAt: { gte: todayStart } },
    });

    const highSeverityCount = await prisma.ick.count({
      where: { severity: { gte: 8 } },
    });

    let topOpportunities = [];
    if (hasNewFields) {
      topOpportunities = await prisma.ick.findMany({
        where: { opportunity_score: { gte: 6 }, severity: { gte: 5 } },
        orderBy: [
          { opportunity_score: "desc" },
          { severity: "desc" },
          { createdAt: "desc" },
        ],
        take: 6,
      });
    } else {
      topOpportunities = await prisma.ick.findMany({
        where: { severity: { gte: 7 } },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 6,
      });
    }

    let criticalIssues = [];
    if (hasNewFields) {
      criticalIssues = await prisma.ick.findMany({
        where: { severity: { gte: 7 }, opportunity_score: { lte: 4 } },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 5,
      });
    } else {
      criticalIssues = await prisma.ick.findMany({
        where: { severity: { gte: 8 } },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 5,
      });
    }

    // Calculate dominant sentiment safely
    const dominantSentiment = sentimentBreakdown.reduce(
      (prev, curr) => (curr._count.sentiment > prev._count.sentiment ? curr : prev),
      { sentiment: "acceptable", _count: { sentiment: 0 } }
    ).sentiment;

    const analytics = {
      total_icks: totalIcks,
      avg_severity: avgStats._avg.severity,
      avg_opportunity: hasNewFields ? avgStats._avg.opportunity_score : null,
      today_count: todayCount,
      high_severity_count: highSeverityCount,
      has_ai_analysis: hasNewFields,

      sentiment_breakdown: sentimentBreakdown,
      category_breakdown: categoryBreakdown,
      user_type_breakdown: userTypeBreakdown,

      top_opportunities: topOpportunities,
      critical_issues: criticalIssues,
      recent_trends: recentTrends,

      insights: {
        most_common_category: categoryBreakdown[0]?.category || "general",
        dominant_sentiment: dominantSentiment,
        trending_up: recentTrends.length > totalIcks * 0.1,
        opportunity_rich: hasNewFields && (avgStats._avg.opportunity_score ?? 0) > 6,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}


// PUT endpoint for updating ick engagement
export async function PUT(req: Request) {
  try {
    const body: { id?: string; action?: string } = await req.json();
    const { id, action } = body;

    if (!id || !action) return NextResponse.json({ error: "ID and action are required" }, { status: 400 });

    let updateData: any = {}; // Prisma.IckUpdateInput replaced with `any`

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

    const updatedIck = await prisma.ick.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    return NextResponse.json(updatedIck);
  } catch (error) {
    console.error("❌ Error updating ick engagement:", error);
    return NextResponse.json({ error: "Failed to update ick" }, { status: 500 });
  }
}
