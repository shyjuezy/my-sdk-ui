import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, MessageSquare, Mail, ArrowRight } from 'lucide-react';

interface CompletionData {
  message: string;
  result: Record<string, unknown>;
  sessionId: string;
}

interface CompletionScreenProps {
  completionData: CompletionData;
  onContinue: () => void;
  onStartNewVerification: () => void;
}

export function CompletionScreen({ 
  completionData, 
  onContinue, 
  onStartNewVerification 
}: CompletionScreenProps) {
  const { message, result } = completionData;
  
  // Type guards for result properties
  const hasTransactionToken = result && typeof result.docvTransactionToken === 'string';
  const hasCustomerId = result && typeof result.customerUserId === 'string';
  
  // Determine icon based on message content
  const getIcon = (): React.ReactElement => {
    if (message.includes('SMS')) {
      return <MessageSquare className="w-16 h-16 text-green-500" />;
    } else if (message.includes('email')) {
      return <Mail className="w-16 h-16 text-blue-500" />;
    }
    return <CheckCircle className="w-16 h-16 text-green-500" />;
  };

  // Determine next steps based on message
  const getNextSteps = (): React.ReactElement => {
    if (message.includes('SMS')) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            We&apos;ve sent a verification message to your phone. Please check your SMS and follow the instructions to complete the process.
          </p>
          <p className="text-xs text-gray-500">
            If you don&apos;t receive the message within a few minutes, check your spam folder or try again.
          </p>
        </div>
      );
    } else if (message.includes('email')) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            We&apos;ve sent verification details to your email address. Please check your inbox and follow the instructions provided.
          </p>
          <p className="text-xs text-gray-500">
            Don&apos;t forget to check your spam or junk folder if you don&apos;t see the email.
          </p>
        </div>
      );
    }
    return (
      <p className="text-sm text-gray-600">
        Your identity verification has been successfully completed. You can now proceed with your application.
      </p>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl shadow-green-200/20">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Verification Complete!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {message}
            </h3>
            {getNextSteps()}
          </div>

          {/* Verification Details */}
          {(hasTransactionToken || hasCustomerId) && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Verification Details
              </h4>
              {hasTransactionToken && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Transaction ID:</span>{' '}
                  <code className="bg-white px-1 rounded text-xs">
                    {String(result.docvTransactionToken).substring(0, 20)}...
                  </code>
                </div>
              )}
              {hasCustomerId && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Customer ID:</span>{' '}
                  <code className="bg-white px-1 rounded text-xs">
                    {String(result.customerUserId)}
                  </code>
                </div>
              )}
              <div className="text-xs text-gray-600">
                <span className="font-medium">Status:</span>{' '}
                <span className="capitalize font-medium text-green-600">
                  {String(result?.status || 'completed')}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onContinue}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={onStartNewVerification}
              variant="outline"
              className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            >
              Start New Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}