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
