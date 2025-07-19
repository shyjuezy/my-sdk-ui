import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompletionScreen } from './CompletionScreen';

interface VerificationContainerProps {
  isVerifying: boolean;
  verificationState: 'idle' | 'verifying' | 'completed' | 'failed';
  completionData: {
    message: string;
    result: Record<string, unknown>;
    sessionId: string;
  } | null;
  onStopVerification: () => void;
  onContinue: () => void;
  onStartNewVerification: () => void;
}

export function VerificationContainer({ 
  isVerifying,
  verificationState,
  completionData,
  onStopVerification,
  onContinue,
  onStartNewVerification
}: VerificationContainerProps) {
  
  // Show completion screen when verification is completed
  if (verificationState === 'completed' && completionData) {
    return (
      <CompletionScreen
        completionData={completionData}
        onContinue={onContinue}
        onStartNewVerification={onStartNewVerification}
      />
    );
  }

  // Show regular verification container
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl shadow-indigo-200/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Identity Verification</CardTitle>
          {isVerifying && (
            <Button
              onClick={onStopVerification}
              variant="outline"
              className="border-red-200 hover:border-red-400 hover:bg-red-50"
            >
              Cancel Verification
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div
            id="verification-container"
            className="min-h-[600px] border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-lg border-gray-300"
          >
            {!isVerifying && 'Verification UI will appear here'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
