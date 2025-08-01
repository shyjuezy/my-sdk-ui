"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, FlaskConical, Code2, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { startVerification } from "@/app/actions/verify";
import { Toast, useToast } from "@/components/ui/toast";
import { useCustomerForm } from "@/hooks/useCustomerForm";
import { useVerificationSDK } from "@/hooks/useVerificationSDK";
import { PersonalInfoSection } from "@/components/forms/PersonalInfoSection";
import { ContactInfoSection } from "@/components/forms/ContactInfoSection";
import { AddressInfoSection } from "@/components/forms/AddressInfoSection";
import { VerificationContainer } from "@/components/verification/VerificationContainer";

export default function Home() {
  const { toasts, showToast, removeToast } = useToast();
  const {
    formData,
    validationErrors,
    setValidationErrors,
    handleInputChange,
    handleSelectChange,
    validateForm,
  } = useCustomerForm();

  const {
    isVerifying,
    verificationState,
    completionData,
    errorMessage,
    initializeSDKVerification,
    stopVerification,
    resetVerification,
  } = useVerificationSDK();

  // Show form when not verifying and not completed and not failed
  const showForm = !isVerifying && verificationState !== "completed" && verificationState !== "failed";

  const verificationMutation = useMutation({
    mutationFn: startVerification,
    onSuccess: async (response) => {
      if (process.env.NODE_ENV === "development") {
        console.log("=== Verification Response ===");
        console.log("Response:", response);
        console.log("===========================");
      }

      if (response.success && response.data?.provider_document_id) {
        showToast("Verification started successfully!", "success");

        try {
          await initializeSDKVerification(
            response.data.provider_document_id as string,
            response.data.provider as string
          );
        } catch (error) {
          const userFriendlyMessage = getSDKErrorMessage(error as Error);
          showToast(userFriendlyMessage, "error");
          console.error("SDK initialization error:", error);
        }
      } else if (response.success) {
        showToast(
          "Verification started but no provider_document_id received",
          "error"
        );
      } else {
        const errorMessage = getErrorMessage(
          response.statusCode,
          response.error
        );
        showToast(errorMessage, "error");
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("=== Mutation Error ===");
        console.error("Error:", error);
        console.error("====================");
      }
      showToast("An unexpected error occurred. Please try again.", "error");
    },
  });

  const getErrorMessage = (statusCode?: number, error?: string): string => {
    switch (statusCode) {
      case 401:
        return `Authentication failed: ${error}`;
      case 400:
        return `Invalid request: ${error}`;
      default:
        return `Error: ${error}`;
    }
  };

  // Helper function to provide user-friendly SDK error messages
  const getSDKErrorMessage = (error: Error): string => {
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin')) {
      return "Unable to connect to verification service due to network restrictions. Server API mode should handle this automatically.";
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network connection error')) {
      return "Network connection error. Please check your connection and try again.";
    } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return "Request timed out. Please try again.";
    } else if (errorMessage.includes('Authentication failed')) {
      return "Authentication failed. Please check your API credentials in the configuration.";
    } else if (errorMessage.includes('Access denied')) {
      return "Access denied. Please verify your API permissions.";
    } else if (errorMessage.includes('not found')) {
      return "Verification service not found. Please check your API configuration.";
    } else if (errorMessage.includes('temporarily unavailable')) {
      return "Verification service is temporarily unavailable. Please try again later.";
    }
    
    return errorMessage || "Something went wrong during verification initialization. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear previous validation errors
    setValidationErrors({});

    // Submit form
    verificationMutation.mutate({
      customerInfo: formData,
    });
  };

  return (
    <>
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="min-h-screen relative overflow-hidden bg-gray-50">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Identity Verification
                </h1>
                <p className="text-gray-600 mt-2">
                  Secure identity verification using server-side API integration
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/npm">
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:border-green-500 hover:text-green-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    NPM Package Mode
                  </Button>
                </Link>
                <Link href="/hybrid">
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Code2 className="w-4 h-4" />
                    Hybrid SDK Mode
                  </Button>
                </Link>
                <Link href="/testing">
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <FlaskConical className="w-4 h-4" />
                    Testing Mode
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Server-Side API Mode
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This mode uses server actions to call the verification API, avoiding CORS issues and keeping your API credentials secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main>
            {/* Always render verification container for SDK */}
            <div
              id="verification-container"
              className="hidden min-h-[600px] max-w-4xl mx-auto border-2 border-dashed rounded-lg border-gray-300"
            />

            <VerificationContainer
              isVerifying={isVerifying}
              verificationState={verificationState}
              completionData={completionData}
              errorMessage={errorMessage}
              onStopVerification={stopVerification}
              onContinue={() => {
                showToast("Proceeding to next step...", "success");
                resetVerification();
              }}
              onStartNewVerification={() => {
                resetVerification();
                showToast("Ready for new verification", "info");
              }}
              showForm={showForm}
              formElement={
                <CustomerForm
                  formData={formData}
                  validationErrors={validationErrors}
                  onInputChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onSubmit={handleSubmit}
                  isSubmitting={verificationMutation.isPending}
                />
              }
            />
          </main>
        </div>
      </div>
    </>
  );
}

// Separate form component for better organization
interface CustomerFormProps {
  formData: ReturnType<typeof useCustomerForm>["formData"];
  validationErrors: ReturnType<typeof useCustomerForm>["validationErrors"];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

function CustomerForm({
  formData,
  validationErrors,
  onInputChange,
  onSelectChange,
  onSubmit,
  isSubmitting,
}: CustomerFormProps) {
  return (
    <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />

      <div className="relative">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Identity Verification
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please provide your information to begin the verification process
          </CardDescription>
          <div className="inline-flex items-center gap-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Server-Side API
          </div>
        </CardHeader>

        <form onSubmit={onSubmit} noValidate suppressHydrationWarning>
          <CardContent className="space-y-6">
            <PersonalInfoSection
              formData={formData}
              validationErrors={validationErrors}
              onInputChange={onInputChange}
            />

            <ContactInfoSection
              formData={formData}
              validationErrors={validationErrors}
              onInputChange={onInputChange}
            />

            <AddressInfoSection
              formData={formData}
              validationErrors={validationErrors}
              onInputChange={onInputChange}
              onSelectChange={onSelectChange}
            />
          </CardContent>

          <CardFooter className="pt-6">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting Verification...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start Verification
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
}
