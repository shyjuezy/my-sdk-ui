"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Script from "next/script";
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
    setSdkLoaded,
    isVerifying,
    initializeSDKVerification,
    stopVerification,
  } = useVerificationSDK();

  // Show form when not verifying
  const showForm = !isVerifying;

  const verificationMutation = useMutation({
    mutationFn: startVerification,
    onSuccess: async (response) => {
      if (process.env.NODE_ENV === "development") {
        console.log("=== Verification Response ===");
        console.log("Response:", response);
        console.log("===========================");
      }

      if (response.success && response.data?.providerDocumentId) {
        showToast("Verification started successfully!", "success");

        try {
          await initializeSDKVerification(response.data.providerDocumentId);
        } catch (error) {
          showToast(
            `Error initializing verification: ${(error as Error).message}`,
            "error"
          );
          console.error("SDK initialization error:", error);
        }
      } else if (response.success) {
        showToast(
          "Verification started but no providerDocumentId received",
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
      {/* SDK Script */}
      <Script
        src="/lib/vecu-idv-web-sdk/dist/index.umd.js"
        strategy="afterInteractive"
        onLoad={() => {
          setSdkLoaded(true);
          console.log("VECU IDV SDK loaded successfully");
        }}
        onError={() => {
          showToast("Failed to load VECU IDV SDK", "error");
        }}
      />

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
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Identity Verification
            </h1>
            <Link href="/testing">
              <Button
                variant="outline"
                className="border-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors duration-200"
              >
                Go to Testing Page
              </Button>
            </Link>
          </header>

          {/* Main Content */}
          <main className="relative min-h-[700px]">
            <div 
              style={{ 
                opacity: showForm ? 1 : 0,
                transform: showForm ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'all 0.3s ease-out',
                WebkitTransition: 'all 0.3s ease-out',
                pointerEvents: showForm ? 'auto' : 'none',
                position: showForm ? 'relative' : 'absolute',
                width: '100%',
                willChange: 'transform, opacity'
              }}
            >
              <CustomerForm
                formData={formData}
                validationErrors={validationErrors}
                onInputChange={handleInputChange}
                onSelectChange={handleSelectChange}
                onSubmit={handleSubmit}
                isSubmitting={verificationMutation.isPending}
              />
            </div>
            <div 
              style={{ 
                opacity: showForm ? 0 : 1,
                transform: showForm ? 'translateX(20px)' : 'translateX(0)',
                transition: 'all 0.3s ease-out',
                WebkitTransition: 'all 0.3s ease-out',
                pointerEvents: showForm ? 'none' : 'auto',
                position: showForm ? 'absolute' : 'relative',
                width: '100%',
                top: 0,
                willChange: 'transform, opacity'
              }}
            >
              <VerificationContainer
                isVerifying={isVerifying}
                onStopVerification={stopVerification}
              />
            </div>
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
        </CardHeader>

        <form onSubmit={onSubmit} noValidate>
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
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer transform-gpu"
              style={{
                WebkitTransform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                perspective: 1000
              }}
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
