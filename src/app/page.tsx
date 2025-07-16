"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  formatPhoneNumber,
  validatePhoneNumber,
  validateEmail,
} from "@/lib/validation";
import { ErrorIcon } from "@/components/ui/error-icon";
import { Toast, useToast } from "@/components/ui/toast";
import { useId } from "react";
import { config } from "@/lib/config";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address: {
    line_1: string;
    line_2?: string;
    locality: string;
    minor_admin_division?: string;
    major_admin_division: string;
    country: string;
    postal_code: string;
    type: string;
  };
}

interface ValidationErrors {
  email?: string;
  phone?: string;
}

// SDK Types
interface VerificationSession {
  id: string;
  provider: string;
  providerSessionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface VerificationEvent {
  type: string;
  data: {
    [key: string]: unknown;
    error?: string;
    message?: string;
  };
}

interface Provider {
  initializeVerification: (options: {
    sessionId: string;
    token: string;
    container: HTMLElement;
    mode: 'embedded' | 'popup';
    config: {
      publicKey: string;
      qrCode?: boolean;
    };
  }) => Promise<unknown>;
  destroy: () => void;
}

interface VecuIDVConstructor {
  new (config: {
    apiKey: string;
    apiUrl: string;
    environment: string;
    providers: {
      socure: {
        publicKey: string;
        environment: string;
        qrCode: boolean;
      };
    };
  }): {
    initialized: boolean;
    activeSessions: Map<string, VerificationSession>;
    providerLoader: {
      load: (provider: string) => Promise<Provider>;
    };
    providerRegistry?: Map<string, Provider>;
    destroy: () => void;
    on: (event: string, handler: (event: VerificationEvent) => void) => void;
  };
}

export default function Home() {
  // Generate unique IDs for accessibility
  const emailErrorId = useId();
  const phoneErrorId = useId();
  const { toasts, showToast, removeToast } = useToast();
  
  // SDK state
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const vecuIDVRef = useRef<{ 
    initialized: boolean;
    activeSessions: Map<string, VerificationSession>;
    providerLoader: {
      load: (provider: string) => Promise<Provider>;
    };
    providerRegistry?: Map<string, Provider>;
    destroy: () => void;
    on: (event: string, handler: (event: VerificationEvent) => void) => void;
  } | null>(null);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    address: {
      line_1: "",
      line_2: "",
      locality: "",
      minor_admin_division: "",
      major_admin_division: "",
      country: "US",
      postal_code: "",
      type: "HOME",
    },
  });

  const verificationMutation = useMutation({
    mutationFn: startVerification,
    onSuccess: async (response) => {
      if (process.env.NODE_ENV === "development") {
        console.log("=== Verification Response ===");
        console.log("Full response object:", response);
        console.log("Success status:", response.success);
        console.log("Response data:", response.data);
        console.log("Status code:", response.statusCode);
        console.log("===========================");
      }

      if (response.success && response.data?.providerDocumentId) {
        showToast("Verification started successfully!", "success");
        console.log("Response ##########", response);
        
        // Extract providerDocumentId and start SDK verification
        const providerDocumentId = response.data.providerDocumentId;
        await initializeSDKVerification(providerDocumentId);
      } else if (response.success) {
        showToast("Verification started but no providerDocumentId received", "error");
      } else {
        if (response.statusCode === 401) {
          showToast(`Authentication failed: ${response.error}`, "error");
        } else if (response.statusCode === 400) {
          showToast(`Invalid request: ${response.error}`, "error");
        } else {
          showToast(`Error: ${response.error}`, "error");
        }
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("=== Mutation Error ===");
        console.error("Error object:", error);
        console.error(
          "Error message:",
          error instanceof Error ? error.message : "Unknown error"
        );
        console.error(
          "Error stack:",
          error instanceof Error ? error.stack : "No stack trace"
        );
        console.error("====================");
      }
      showToast("An unexpected error occurred. Please try again.", "error");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      // Handle phone number formatting
      if (name === "phone") {
        const formattedPhone = formatPhoneNumber(value);
        setFormData((prev) => ({
          ...prev,
          [name]: formattedPhone,
        }));

        // Validate phone number only if there's a value
        if (formattedPhone && !validatePhoneNumber(formattedPhone)) {
          setValidationErrors((prev) => ({
            ...prev,
            phone: "Please enter a valid 10-digit US phone number",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            phone: undefined,
          }));
        }
      }
      // Handle email validation
      else if (name === "email") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        // Validate email only if there's a value
        if (value && !validateEmail(value)) {
          setValidationErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            email: undefined,
          }));
        }
      }
      // Handle other fields
      else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const initializeSDKVerification = async (docvToken: string) => {
    try {
      setIsVerifying(true);
      setShowForm(false);
      
      // Wait for SDK to be loaded
      const windowWithSDK = window as unknown as Window & { VecuIDV?: { VecuIDV: VecuIDVConstructor } };
      if (!sdkLoaded || !windowWithSDK.VecuIDV) {
        showToast('SDK not loaded yet. Please wait...', 'error');
        setShowForm(true);
        setIsVerifying(false);
        return;
      }
      
      const VecuIDV = windowWithSDK.VecuIDV.VecuIDV;
      
      // Initialize SDK
      vecuIDVRef.current = new VecuIDV({
        apiKey: 'your-real-api-key',
        apiUrl: 'http://localhost:3000/api',
        environment: 'development',
        providers: {
          socure: {
            publicKey: config.sdkKey,
            environment: 'sandbox',
            qrCode: true
          }
        }
      });
      
      // Subscribe to events
      vecuIDVRef.current.on('verification:completed', (event: VerificationEvent) => {
        showToast('Verification completed successfully!', 'success');
        console.log('Verification result:', event.data);
        // Optionally reset the form and show it again
        setShowForm(true);
        setIsVerifying(false);
      });
      
      vecuIDVRef.current.on('verification:failed', (event: VerificationEvent) => {
        showToast(`Verification failed: ${event.data.error}`, 'error');
        setShowForm(true);
        setIsVerifying(false);
      });
      
      vecuIDVRef.current.on('error', (event: VerificationEvent) => {
        showToast(`Error: ${event.data.message}`, 'error');
      });
      
      // Force the SDK to be initialized without calling the backend
      vecuIDVRef.current.initialized = true;
      
      // Create a minimal session
      const testSessionData: VerificationSession = {
        id: 'session-' + Date.now(),
        provider: 'socure',
        providerSessionId: docvToken,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store the session in the SDK's active sessions
      vecuIDVRef.current.activeSessions.set(testSessionData.id, testSessionData);
      
      // Load the Socure provider
      const provider = await vecuIDVRef.current.providerLoader.load('socure');
      
      // Initialize the verification UI
      const container = document.querySelector('#verification-container');
      if (!container) {
        throw new Error('Verification container not found');
      }
      
      await provider.initializeVerification({
        sessionId: testSessionData.id,
        token: docvToken,
        container: container as HTMLElement,
        mode: 'embedded',
        config: {
          publicKey: config.sdkKey,
          qrCode: true
        }
      });
      
    } catch (error) {
      showToast(`Error initializing verification: ${(error as Error).message}`, 'error');
      console.error('SDK initialization error:', error);
      setShowForm(true);
      setIsVerifying(false);
    }
  };

  const stopVerification = async () => {
    try {
      // Clean up the provider if it exists
      if (vecuIDVRef.current) {
        const provider = vecuIDVRef.current.providerRegistry?.get('socure');
        if (provider) {
          provider.destroy();
        }
        
        // Clear active sessions
        vecuIDVRef.current.activeSessions.clear();
        vecuIDVRef.current.destroy();
        vecuIDVRef.current = null;
      }
    } catch (error) {
      console.error('Error cleaning up:', error);
    }
    
    // Reset UI
    setIsVerifying(false);
    setShowForm(true);
    const container = document.getElementById('verification-container');
    if (container) {
      container.innerHTML = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email and phone only if they have values
    const errors: ValidationErrors = {};

    if (formData.email && !validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      errors.phone = "Please enter a valid 10-digit US phone number";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Use the mutation to submit the form
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
          console.log('VECU IDV SDK loaded successfully');
        }}
        onError={() => {
          showToast('Failed to load VECU IDV SDK', 'error');
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

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-gradient-xy"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse"></div>

        {/* Floating gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                Identity Verification
              </h1>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full transform scale-x-0 animate-scale-x"></div>
            </div>
            <Link href="/testing">
              <Button
                variant="outline"
                className="relative overflow-hidden border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/50 group"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  Go to Testing Page
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Button>
            </Link>
          </div>

          {showForm ? (
            <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl shadow-indigo-200/20 hover:shadow-indigo-300/30 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
            {/* Card gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-xl"></div>
            <div className="absolute inset-[1px] bg-white/90 backdrop-blur-sm rounded-lg"></div>

            <div className="relative z-10">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Customer Information
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Please fill in your information to start the verification
                  process.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-6">
                  <fieldset>
                    <legend className="sr-only">Personal Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="firstName"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="John"
                          autoComplete="given-name"
                          aria-required="true"
                          aria-label="First Name"
                          className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="middleName"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          Middle Name
                        </Label>
                        <Input
                          id="middleName"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          placeholder="Michael"
                          autoComplete="additional-name"
                          aria-label="Middle Name (optional)"
                          className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="lastName"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="Doe"
                          autoComplete="family-name"
                          aria-required="true"
                          aria-label="Last Name"
                          className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="sr-only">Contact Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="email"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          Email
                          <span className="text-muted-foreground ml-1">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john.doe@example.com"
                          autoComplete="email"
                          aria-label="Email (optional)"
                          aria-invalid={!!validationErrors.email}
                          aria-describedby={
                            validationErrors.email ? emailErrorId : undefined
                          }
                          className={`transition-all duration-200 hover:border-gray-300 ${
                            validationErrors.email
                              ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                              : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                          }`}
                        />
                        {validationErrors.email && (
                          <p
                            id={emailErrorId}
                            role="alert"
                            aria-live="polite"
                            className="text-sm text-red-500 flex items-center gap-1 animate-fade-in"
                          >
                            <ErrorIcon />
                            {validationErrors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="phone"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          Phone
                          <span className="text-muted-foreground ml-1">
                            (optional)
                          </span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(555) 123-4567"
                          autoComplete="tel"
                          inputMode="tel"
                          aria-label="Phone (optional)"
                          aria-invalid={!!validationErrors.phone}
                          aria-describedby={
                            validationErrors.phone ? phoneErrorId : undefined
                          }
                          className={`transition-all duration-200 hover:border-gray-300 ${
                            validationErrors.phone
                              ? "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                              : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20"
                          }`}
                        />
                        {validationErrors.phone && (
                          <p
                            id={phoneErrorId}
                            role="alert"
                            aria-live="polite"
                            className="text-sm text-red-500 flex items-center gap-1 animate-fade-in"
                          >
                            <ErrorIcon />
                            {validationErrors.phone}
                          </p>
                        )}
                        {formData.phone &&
                          validatePhoneNumber(formData.phone) && (
                            <p className="text-sm text-green-600 animate-fade-in">
                              ✓ Valid US phone number
                            </p>
                          )}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-4">
                    <legend className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Address
                    </legend>

                    <div className="space-y-2 group">
                      <Label
                        htmlFor="address.line_1"
                        className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                      >
                        Address Line 1 *
                      </Label>
                      <Input
                        id="address.line_1"
                        name="address.line_1"
                        value={formData.address.line_1}
                        onChange={handleInputChange}
                        required
                        placeholder="200 Key Square St"
                        autoComplete="address-line1"
                        aria-required="true"
                        aria-label="Address Line 1"
                        className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                      />
                    </div>

                    <div className="space-y-2 group">
                      <Label
                        htmlFor="address.line_2"
                        className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                      >
                        Address Line 2
                      </Label>
                      <Input
                        id="address.line_2"
                        name="address.line_2"
                        value={formData.address.line_2}
                        onChange={handleInputChange}
                        placeholder="Apt 4B"
                        autoComplete="address-line2"
                        aria-label="Address Line 2 (optional)"
                        className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="address.locality"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          City *
                        </Label>
                        <Input
                          id="address.locality"
                          name="address.locality"
                          value={formData.address.locality}
                          onChange={handleInputChange}
                          required
                          placeholder="New York City"
                          autoComplete="address-level2"
                          aria-required="true"
                          aria-label="City"
                          className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="address.major_admin_division"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          State *
                        </Label>
                        <Input
                          id="address.major_admin_division"
                          name="address.major_admin_division"
                          value={formData.address.major_admin_division}
                          onChange={handleInputChange}
                          required
                          placeholder="NY"
                          maxLength={2}
                          autoComplete="address-level1"
                          aria-required="true"
                          aria-label="State"
                          className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label
                          htmlFor="address.postal_code"
                          className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                        >
                          Postal Code *
                        </Label>
                        <Input
                          id="address.postal_code"
                          name="address.postal_code"
                          value={formData.address.postal_code}
                          onChange={handleInputChange}
                          required
                          placeholder="12345"
                          maxLength={5}
                          autoComplete="postal-code"
                          inputMode="numeric"
                          pattern="[0-9]{5}"
                          aria-required="true"
                          aria-label="Postal Code"
                          className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 group">
                      <Label
                        htmlFor="address.minor_admin_division"
                        className="text-gray-700 group-focus-within:text-indigo-600 transition-colors duration-200"
                      >
                        County/District
                      </Label>
                      <Input
                        id="address.minor_admin_division"
                        name="address.minor_admin_division"
                        value={formData.address.minor_admin_division}
                        onChange={handleInputChange}
                        placeholder="Manhattan"
                        autoComplete="address-level3"
                        aria-label="County/District (optional)"
                        className="border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                  </fieldset>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:scale-[1.02] group cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                      disabled={verificationMutation.isPending}
                    >
                      <span className="relative z-10">
                        {verificationMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Starting Verification...
                          </span>
                        ) : (
                          "Start Verification"
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </Button>
                  </CardFooter>
                </form>
              </div>
            </Card>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl shadow-indigo-200/20">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Identity Verification</CardTitle>
                  {isVerifying && (
                    <Button
                      onClick={stopVerification}
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
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
