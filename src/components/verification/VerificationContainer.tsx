import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompletionScreen } from "./CompletionScreen";

interface VerificationContainerProps {
  isVerifying: boolean;
  verificationState: "idle" | "verifying" | "completed" | "failed";
  completionData: {
    message: string;
    result: Record<string, unknown>;
    sessionId: string;
  } | null;
  onStopVerification: () => void;
  onContinue: () => void;
  onStartNewVerification: () => void;
  showForm: boolean;
  formElement: React.ReactNode;
  errorMessage?: string | null; // Add error message prop
}

export function VerificationContainer({
  isVerifying,
  verificationState,
  completionData,
  onStopVerification,
  onContinue,
  onStartNewVerification,
  showForm,
  formElement,
  errorMessage,
}: VerificationContainerProps) {
  // Show completion screen when verification is completed
  if (verificationState === "completed" && completionData) {
    return (
      <CompletionScreen
        completionData={completionData}
        onContinue={onContinue}
        onStartNewVerification={onStartNewVerification}
      />
    );
  }

  // Show error screen when verification failed
  if (verificationState === "failed") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Error display only - no form */}
        <Card className="backdrop-blur-sm bg-red-50/90 border-red-200 shadow-2xl shadow-red-200/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-800">Verification Failed</CardTitle>
            <Button
              onClick={onStartNewVerification}
              variant="outline"
              className="border-red-300 hover:border-red-500 hover:bg-red-100"
            >
              Try Again
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 py-4">
              {/* Error icon */}
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.134 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              {/* Error message */}
              <div className="flex-1">
                <p className="text-red-800 font-medium mb-1">
                  Unable to Complete Verification
                </p>
                <p className="text-red-700 text-sm">
                  {errorMessage || "Something went wrong during verification. Please try again."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Show form when needed */}
      {showForm && formElement}

      {/* Verification UI status card */}
      {isVerifying && (
        <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl shadow-indigo-200/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Identity Verification</CardTitle>
            <Button
              onClick={onStopVerification}
              variant="outline"
              className="border-red-200 hover:border-red-400 hover:bg-red-50"
            >
              Cancel Verification
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-indigo-600">
                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <span>Verification in progress...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
