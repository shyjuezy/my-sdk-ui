"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Toast, useToast } from "@/components/ui/toast";
import { useCustomerForm } from "@/hooks/useCustomerForm";
import { useVerificationSDKNPM } from "@/hooks/useVerificationSDKNPM";
import { PersonalInfoSection } from "@/components/forms/PersonalInfoSection";
import { ContactInfoSection } from "@/components/forms/ContactInfoSection";
import { AddressInfoSection } from "@/components/forms/AddressInfoSection";
import { VerificationContainer } from "@/components/verification/VerificationContainer";
import type { CustomerInfo } from "@/types/customer";

export default function NPMSDKPage() {
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
    initializeSDKVerificationWithCustomer,
    stopVerification,
    resetVerification,
  } = useVerificationSDKNPM();

  // Show form when not verifying and not completed and not failed
  const showForm = !isVerifying && verificationState !== "completed" && verificationState !== "failed";

  // Helper function to provide user-friendly error messages
  const getErrorMessage = (error: Error): string => {
    const errorMessage = error.message || '';
    
    if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control-Allow-Origin')) {
      return "Unable to connect to verification service due to network restrictions. Try using the Server API mode instead (main page).";
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
    
    return errorMessage || "Something went wrong during verification. Please try again.";
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

    try {
      // Convert form data to SDK customer info format
      const customerInfo: CustomerInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: {
          line1: formData.address.line1,
          line2: formData.address.line2 || undefined,
          locality: formData.address.locality,
          minorAdminDivision: formData.address.minorAdminDivision || undefined,
          majorAdminDivision: formData.address.majorAdminDivision,
          country: formData.address.country,
          postalCode: formData.address.postalCode,
          type: formData.address.type,
        },
      };

      // Start verification directly with customer info using NPM SDK
      await initializeSDKVerificationWithCustomer(
        customerInfo,
        "sandbox" // Default deployment stage
      );

      showToast("Verification started successfully with NPM SDK!", "success");
    } catch (error) {
      const userFriendlyMessage = getErrorMessage(error as Error);
      showToast(userFriendlyMessage, "error");
      console.error("NPM SDK verification error:", error);
    }
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Identity Verification (NPM SDK)
                </h1>
                <p className="text-gray-600 mt-2">
                  Using the published vec-idp-web-sdk@1.0.0 npm package
                </p>
              </div>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-green-500 hover:text-green-600 transition-all duration-200"
                >
                  Back to Main Page
                </Button>
              </Link>
            </div>

            {/* Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Package className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    NPM Package Integration
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      This page demonstrates identity verification using the officially published{" "}
                      <code className="bg-green-100 px-1 rounded">vec-idp-web-sdk@1.0.0</code> npm package.
                      The SDK handles customer data processing and verification flow directly.
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
                <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-blue-600" />

                  <div className="relative">
                    <CardHeader className="text-center space-y-3 pb-2">
                      <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-semibold text-gray-900">
                        Identity Verification
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        NPM SDK will handle the verification process directly
                      </CardDescription>
                      <div className="inline-flex items-center gap-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2">
                        <Package className="w-3 h-3" />
                        NPM Package v1.0.0
                      </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit} noValidate suppressHydrationWarning>
                      <CardContent className="space-y-6">
                        <PersonalInfoSection
                          formData={formData}
                          validationErrors={validationErrors}
                          onInputChange={handleInputChange}
                        />

                        <ContactInfoSection
                          formData={formData}
                          validationErrors={validationErrors}
                          onInputChange={handleInputChange}
                        />

                        <AddressInfoSection
                          formData={formData}
                          validationErrors={validationErrors}
                          onInputChange={handleInputChange}
                          onSelectChange={handleSelectChange}
                        />
                      </CardContent>

                      <CardFooter className="pt-6">
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Starting Verification...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Start NPM SDK Verification
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </div>
                </Card>
              }
            />
          </main>
        </div>
      </div>
    </>
  );
}