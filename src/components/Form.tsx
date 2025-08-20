import { useState } from "react";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function IckSubmissionForm(): React.ReactElement {
  const [ick, setIck] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [charCount, setCharCount] = useState(0);

  const maxChars = 500;
  const minChars = 3;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleInputChange = (value: string) => {
    setIck(value);
    setCharCount(value.length);
    // Reset error state when user starts typing again
    if (submitStatus === "error") {
      setSubmitStatus("idle");
      setErrorMessage("");
    }
  };

  const validateInput = (): { isValid: boolean; error?: string } => {
    const trimmedContent = ick.trim();
    
    if (!trimmedContent) {
      return { isValid: false, error: "Please share what's bugging you!" };
    }
    
    if (trimmedContent.length < minChars) {
      return { isValid: false, error: `Your ick must be at least ${minChars} characters long` };
    }
    
    if (trimmedContent.length > maxChars) {
      return { isValid: false, error: `Your ick must be less than ${maxChars} characters` };
    }
    
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input first
    const validation = validateInput();
    if (!validation.isValid) {
      setSubmitStatus("error");
      setErrorMessage(validation.error || "Invalid input");
      setTimeout(() => {
        setSubmitStatus("idle");
        setErrorMessage("");
      }, 3000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const requestBody = {
        content: ick.trim(),
        tags: selectedTags,
        user_type: "venter" // Default user type
      };

      console.log("Submitting ick:", requestBody);

      const response = await fetch("/api/icks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody),
      });

      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log("Response status:", response.status, "Response:", responseText);

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          // Response isn't JSON, use status-based message
          switch (response.status) {
            case 400:
              errorMsg = "Invalid input. Please check your ick and try again.";
              break;
            case 429:
              errorMsg = "Slow down! You're submitting too quickly.";
              break;
            case 500:
              errorMsg = "Server is having issues. Please try again in a moment.";
              break;
            case 503:
              errorMsg = "Service temporarily unavailable. Please try again later.";
              break;
            default:
              errorMsg = "Something went wrong. Please try again.";
          }
        }
        
        throw new Error(errorMsg);
      }

      // Parse successful response
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // If we can't parse JSON but got 200, assume success
        responseData = { success: true };
      }

      console.log("Success! Ick saved:", responseData);
      
      setSubmitStatus("success");
      setIck("");
      setSelectedTags([]);
      setCharCount(0);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 3000);

    } catch (err) {
      console.error("Failed to save Ick:", err);
      
      const errorMsg = err instanceof Error ? err.message : "Failed to save your ick. Please try again.";
      setErrorMessage(errorMsg);
      setSubmitStatus("error");
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setErrorMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidInput = ick.trim().length >= minChars && ick.trim().length <= maxChars;
  const charCountColor = charCount > maxChars * 0.9 ? 'text-red-500' : 
                        charCount > maxChars * 0.7 ? 'text-orange-500' : 'text-slate-500';

  // Predefined tags for easy selection
  const popularTags = [
    "tech", "work", "social", "dating", "food", "transport", 
    "shopping", "family", "health", "money", "education", "entertainment"
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Input */}
        <div className="space-y-2">
          <label htmlFor="ick-input" className="block text-lg font-semibold text-slate-700">
            What's your ick? 🤢
          </label>
          <div className="relative">
            <textarea
              id="ick-input"
              value={ick}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Share what's bothering you... Be specific and honest!"
              className={`w-full p-4 border-2 rounded-2xl resize-none transition-all duration-200 focus:outline-none ${
                submitStatus === "error" 
                  ? "border-red-300 focus:border-red-500 bg-red-50" 
                  : isValidInput 
                    ? "border-green-300 focus:border-green-500 bg-green-50" 
                    : "border-slate-300 focus:border-orange-500 bg-white"
              } ${isSubmitting ? 'opacity-50' : ''}`}
              rows={4}
              disabled={isSubmitting}
            />
            <div className={`absolute bottom-3 right-3 text-sm ${charCountColor}`}>
              {charCount}/{maxChars}
            </div>
          </div>
          {charCount > 0 && charCount < minChars && (
            <p className="text-sm text-orange-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Need at least {minChars - charCount} more characters
            </p>
          )}
        </div>

        {/* Tags Section */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-slate-700">
            Add tags (optional) 🏷️
          </label>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                disabled={isSubmitting}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-slate-600">Selected:</span>
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Ick saved successfully! 🎉</p>
              <p className="text-sm text-green-700">Thanks for sharing what bugs you!</p>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-800">Oops! Something went wrong</p>
              <p className="text-sm text-red-700">{errorMessage || "Please try again in a moment."}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isValidInput}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
            isSubmitting
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : isValidInput
                ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving your ick...
            </div>
          ) : (
            "Share This Ick! 🚀"
          )}
        </button>

        {/* Helper Text */}
        <p className="text-sm text-slate-500 text-center">
          Your ick will be analyzed and added to our insights. Stay anonymous! 
          {selectedTags.length > 0 && ` • ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`}
        </p>
      </form>
    </div>
  );
}