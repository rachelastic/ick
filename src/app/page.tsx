"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Target,
  Lightbulb,
  Coffee,
  Sparkles,
  DollarSign,
  Rocket,
  Search,
  Plus,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ContentStat {
  number: string;
  label: string;
  sublabel: string;
}

interface UserTypeContent {
  subheadline: string;
  description: string;
  primaryCTA: string;
  secondaryCTA: string;
  primaryIcon: React.ReactElement;
  secondaryIcon: React.ReactElement;
  bgGradient: string;
  stats: ContentStat[];
}

const DynamicHeroLanding = () => {
  const [userType, setUserType] = useState<"vent" | "build">("vent");
  const [stats] = useState({
    totalIcks: 3247,
    ideasFound: 127,
    buildersCommunity: 892,
  });

  const [currentExample, setCurrentExample] = useState(0);
  const opportunityIcks = [
    "Airport wifi that makes you watch ads to connect",
    "Parking meters that don&apos;t take cards in 2024",
    "Subscription services that hide the cancel button",
    "Apps that require phone numbers for no reason",
    "Websites that auto-play videos with sound",
  ];

  const getContentForUserType = (): UserTypeContent => {
    switch (userType) {
      case "vent":
        return {
          subheadline:
            "That app that crashes right when you need it? The subscription you cannot cancel? Share it here – someone is listening.",
          description:
            "Join 3,247 people venting their product frustrations to a community that actually gets it. Your pain is valid, you re not alone, and sometimes your complaints actually get fixed.",
          primaryCTA: "Start Venting",
          secondaryCTA: "See Other Pains",
          primaryIcon: <MessageSquare size={20} />,
          secondaryIcon: <Eye size={20} />,
          bgGradient: "from-red-500 via-orange-500 to-pink-500",
          stats: [
            {
              number: stats.totalIcks.toLocaleString(),
              label: "People Venting Daily",
              sublabel: "You are not alone",
            },
            {
              number: "847",
              label: "Validated Frustrations",
              sublabel: "Others feel your pain",
            },
            {
              number: "23",
              label: "Problems Fixed",
              sublabel: "Real change happens",
            },
          ],
        };
      case "build":
        return {
          subheadline:
            "Every user complaint is a business opportunity waiting to be discovered. Browse pre-validated pain points and find what to build next.",
          description:
            "Skip the guesswork. Access 3,247 real user frustrations, validated by community votes, categorized by opportunity size. Your next million-dollar idea is hiding in plain sight.",
          primaryCTA: "Hunt Opportunities",
          secondaryCTA: "Browse Problems",
          primaryIcon: <Rocket size={20} />,
          secondaryIcon: <BarChart3 size={20} />,
          bgGradient: "from-green-500 via-blue-500 to-purple-500",
          stats: [
            {
              number: stats.ideasFound.toString(),
              label: "Active Opportunities",
              sublabel: "Ready to build",
            },
            {
              number: "$2.3M",
              label: "Combined Market Size",
              sublabel: "Validated potential",
            },
            {
              number: stats.buildersCommunity.toString(),
              label: "Builder Network",
              sublabel: "Your opportunity peers",
            },
          ],
        };
    }
  };

  const content = getContentForUserType();

  const [floatingIcons] = useState([
    "💡",
    "💰",
    "🚀",
    "⚡",
    "🔥",
    "💎",
    "🎯",
    "✨",
  ]);

  const [iconPositions, setIconPositions] = useState<Array<{left: number, top: number, duration: number}>>([]);

  useEffect(() => {
    // Generate random positions only on client side
    const positions = floatingIcons.map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 4 + Math.random() * 2
    }));
    setIconPositions(positions);

    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % opportunityIcks.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 text-slate-800 relative overflow-hidden">
      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {iconPositions.length > 0 && floatingIcons.map((icon, i) => (
          <div
            key={i}
            className="absolute animate-bounce text-3xl opacity-20"
            style={{
              left: `${iconPositions[i].left}%`,
              top: `${iconPositions[i].top}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${iconPositions[i].duration}s`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Dynamic Hero Section */}
      <main className="relative z-10 flex flex-col items-center w-full px-6 py-12">
        <section className="text-center max-w-6xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-pink-100 border border-orange-200 px-6 py-3 rounded-full text-sm font-semibold text-orange-700 mb-8">
            <Sparkles size={16} />
            <span>Where product frustrations meet solutions</span>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-tight">
            <span className="text-slate-800">VENT YOUR</span>
            <br />
            <span
              className={`bg-gradient-to-r ${content.bgGradient} bg-clip-text text-transparent`}
            >
              PRODUCT
            </span>
            <br />
            <span className="text-slate-800">RAGE</span>
          </h1>

          {/* User Type Toggle */}
          <div className="mb-8">
            <p className="text-lg text-slate-600 mb-4">I want to:</p>
            <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 border-2 border-orange-200 shadow-lg">
              {["vent", "build"].map((type) => (
                <button
                  key={type}
                  onClick={() => setUserType(type as "vent" | "build")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    userType === type
                      ? type === "vent"
                        ? "bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-md"
                        : type === "build"
                        ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md"
                        : "bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {type === "vent"
                    ? "Share My Frustrations"
                    : type === "build"
                    ? "Find Opportunities"
                    : "Both"}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="relative mb-8 transition-all duration-700 ease-in-out">
            <p className="text-2xl md:text-3xl text-slate-600 mb-4 font-medium leading-relaxed">
              {content.subheadline}
            </p>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Live Feed */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 mb-12 max-w-4xl mx-auto shadow-2xl border border-orange-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <span className="text-sm text-slate-500 font-medium">
                {userType === "vent"
                  ? "Latest Frustration Shared"
                  : userType === "build"
                  ? "Hot Opportunity Alert"
                  : "Community Highlight"}
              </span>
              <div className="flex-1"></div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>

            <div className="text-left">
              <div className="text-lg text-slate-600 mb-4 italic font-medium">
                "{opportunityIcks[currentExample]}"
              </div>
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex gap-3">
                  {userType === "vent" ? (
                    <>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        😡 847 feel this
                      </span>
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                        🙋‍♀️ Me too!
                      </span>
                    </>
                  ) : userType === "build" ? (
                    <>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        💰 High opportunity
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        🎯 Validated pain
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        😡 847 users
                      </span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        💡 Solution ready
                      </span>
                    </>
                  )}
                </div>
                <div className="text-sm text-slate-500">
                  {userType === "vent"
                    ? "👥 Community validated"
                    : userType === "build"
                    ? "🎯 Opportunity score: 9.2/10"
                    : "🚀 Ready for action"}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href={userType === "vent" ? "/ick" : "/insights"} passHref>
              <button
                className={`group bg-gradient-to-r ${content.bgGradient} text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${content.bgGradient
                    .replace("from-", "from-")
                    .replace("via-", "via-")
                    .replace(
                      "to-",
                      "to-"
                    )} opacity-0 group-hover:opacity-100 transition-opacity`}
                  style={{ filter: "brightness(110%)" }}
                ></div>
                <span className="relative flex items-center gap-3">
                  {content.primaryIcon}
                  {content.primaryCTA}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </button>
            </Link>
            <button className="bg-white/90 backdrop-blur-sm text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300">
              <span className="flex items-center gap-3">
                {content.secondaryIcon}
                {content.secondaryCTA}
              </span>
            </button>
          </div>
          
          {/* Dynamic Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {content.stats.map((stat: ContentStat, index: number) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${
                  index === 0
                    ? "from-orange-100 to-orange-200 border-orange-300"
                    : index === 1
                    ? "from-green-100 to-green-200 border-green-300"
                    : "from-purple-100 to-purple-200 border-purple-300"
                } rounded-2xl p-6 border hover:shadow-lg transition-all duration-500`}
              >
                <div
                  className={`text-3xl font-black mb-2 ${
                    index === 0
                      ? "text-orange-600"
                      : index === 1
                      ? "text-green-600"
                      : "text-purple-600"
                  }`}
                >
                  {stat.number}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    index === 0
                      ? "text-orange-700"
                      : index === 1
                      ? "text-green-700"
                      : "text-purple-700"
                  }`}
                >
                  {stat.label}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    index === 0
                      ? "text-orange-600"
                      : index === 1
                      ? "text-green-600"
                      : "text-purple-600"
                  }`}
                >
                  {stat.sublabel}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl w-full mx-auto mt-16 px-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-8 text-center">
            <span className={`bg-gradient-to-r ${content.bgGradient} bg-clip-text text-transparent`}>
              Frequently Asked
            </span>{" "}
            Questions
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {[
              {
                q: "What is even an ick?",
                a: "An `ick` is that tiny detail that instantly kills the vibe — irrational, petty, but totally valid. It could be how someone eats, types, or breathes too loud. Nothing is too small to be ick-worthy.",
              },
              {
                q: userType === "vent" ? "How does my ick matter?" : "How can I find validated opportunities?",
                a: userType === "vent" 
                  ? "Your ick adds to a collective dataset that helps us analyze product pain points and user frustrations. Every complaint submitted teaches our community what real problems look like and validates shared experiences."
                  : "Browse through thousands of real user frustrations, sorted by validation score and market opportunity. Each complaint represents a potential business idea that&apos;s already been validated by community sentiment.",
              },
              {
                q: userType === "vent" ? "Will my complaints actually get fixed?" : "How do I know these are real opportunities?",
                a: userType === "vent"
                  ? "While we can&apos;t guarantee fixes, many companies do monitor user feedback. Your complaints become part of a public record that product teams can discover, and community pressure often leads to real changes."
                  : "Every opportunity is backed by real user complaints with community validation scores. You can see exactly how many people share the same frustration, making it easier to assess market demand before building.",
              },
              {
                q: userType === "vent" ? "Is this just venting or does it help?" : "What kind of opportunities can I find?",
                a: userType === "vent"
                  ? "It&apos;s both! Venting feels good and validates your experience, but it also contributes to a database that helps identify systemic product issues. Your frustration might be the data point that sparks the next big solution."
                  : "From simple browser extensions to full SaaS platforms - opportunities range from quick weekend projects to million-dollar ideas. Each complaint includes context about user pain levels and potential market size.",
              },
              {
                q: userType === "vent" ? "Can I stay anonymous?" : "How accurate is the opportunity scoring?",
                a: userType === "vent"
                  ? "Absolutely. You can share your frustrations without any personal information. We focus on the product problems, not who&apos;s reporting them."
                  : "Our scoring combines community validation, market signals, and technical feasibility analysis. While not perfect, it&apos;s based on real user data and helps prioritize which problems are worth solving first.",
              },
            ].map((item) => (
              <AccordionItem 
                key={item.q} 
                value={item.q}
                className="bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-200 px-6 mb-3 hover:bg-white/80 transition-all duration-300"
              >
                <AccordionTrigger className="text-lg font-semibold text-slate-800 hover:no-underline py-6">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed pb-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </div>
  );
};

export default DynamicHeroLanding;