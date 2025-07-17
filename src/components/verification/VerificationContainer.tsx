import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VerificationContainerProps {
  isVerifying: boolean;
  onStopVerification: () => void;
}

export function VerificationContainer({ 
  isVerifying, 
  onStopVerification 
}: VerificationContainerProps) {
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
