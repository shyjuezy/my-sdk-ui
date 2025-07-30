"use client";

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
import { Toast, useToast } from "@/components/ui/toast";
import { useCustomerForm } from "@/hooks/useCustomerForm";
import { useVerificationSDKHybrid } from "@/hooks/useVerificationSDKHybrid";
import { PersonalInfoSection } from "@/components/forms/PersonalInfoSection";
import { ContactInfoSection } from "@/components/forms/ContactInfoSection";
import { AddressInfoSection } from "@/components/forms/AddressInfoSection";
import { VerificationContainer } from "@/components/verification/VerificationContainer";
import type { CustomerInfo } from "@/types/customer";

export default function HybridPage() {
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
    initializeSDKVerificationWithCustomer,
    stopVerification,
    resetVerification,
  } = useVerificationSDKHybrid();

  // Show form when not verifying and not completed
  const showForm = !isVerifying && verificationState !== "completed";

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

      // Start verification directly with customer info
      await initializeSDKVerificationWithCustomer(
        customerInfo,
        "sandbox" // Default deployment stage
      );

      showToast("Verification started successfully!", "success");
    } catch (error) {
      showToast(
        `Error starting verification: ${(error as Error).message}`,
        "error"
      );
      console.error("Verification error:", error);
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Identity Verification (Hybrid SDK)
              </h1>
              <p className="text-gray-600 mt-2">
                Testing direct customer verification via SDK
              </p>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors duration-200"
              >
                Back to Main Page
              </Button>
            </Link>
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
                        SDK will handle the API call and verification flow
                      </CardDescription>
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
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200"
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
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
              }
            />
          </main>
        </div>
      </div>
    </>
  );
}