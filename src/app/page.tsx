"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingSelect } from "@/components/ui/floating-select";
import { US_STATES } from "@/lib/us-states";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Globe, 
  CheckCircle2,
  ArrowRight,
  Shield
} from "lucide-react";
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
import { Toast, useToast } from "@/components/ui/toast";
import { useId } from "react";
import { config } from "@/lib/config";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    locality: string;
    minorAdminDivision?: string;
    majorAdminDivision: string;
    country: string;
    postalCode: string;
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
      line1: "",
      line2: "",
      locality: "",
      minorAdminDivision: "",
      majorAdminDivision: "",
      country: "US",
      postalCode: "",
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
      
      // Capitalize first letter of each word for city field
      let processedValue = value;
      if (addressField === "locality") {
        processedValue = value
          .split(' ')
          .map(word => {
            if (word.length === 0) return word;
            // Handle special cases like "st." or "mt."
            if (word.toLowerCase().endsWith('.')) {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join(' ');
      }
      
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: processedValue,
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

        // Always validate phone number
        if (!formattedPhone || !validatePhoneNumber(formattedPhone)) {
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

        // Always validate email
        if (!value || !validateEmail(value)) {
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

    // Validate required email and phone fields
    const errors: ValidationErrors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone) {
      errors.phone = "Phone is required";
    } else if (!validatePhoneNumber(formData.phone)) {
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

      <div className="min-h-screen relative overflow-hidden bg-gray-50">
        {/* Simple gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
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
          </div>

          {showForm ? (
            <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

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
              <form onSubmit={handleSubmit} noValidate>
                <CardContent className="space-y-6">
                  <fieldset>
                    <legend className="sr-only">Personal Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <FloatingInput
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          label="First Name"
                          icon={User}
                          autoComplete="given-name"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <FloatingInput
                          id="middleName"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          label="Middle Name"
                          icon={User}
                          autoComplete="additional-name"
                        />
                      </div>
                      <div>
                        <FloatingInput
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          label="Last Name"
                          icon={User}
                          autoComplete="family-name"
                          aria-required="true"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="sr-only">Contact Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FloatingInput
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          label="Email"
                          icon={Mail}
                          autoComplete="email"
                          aria-required="true"
                          aria-invalid={!!validationErrors.email}
                          aria-describedby={
                            validationErrors.email ? emailErrorId : undefined
                          }
                          error={validationErrors.email}
                        />
                      </div>
                      <div>
                        <FloatingInput
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          label="Phone"
                          icon={Phone}
                          autoComplete="tel"
                          inputMode="tel"
                          aria-required="true"
                          aria-invalid={!!validationErrors.phone}
                          aria-describedby={
                            validationErrors.phone ? phoneErrorId : undefined
                          }
                          error={validationErrors.phone}
                        />
                        {formData.phone &&
                          validatePhoneNumber(formData.phone) && (
                            <p className="text-sm text-green-600 flex items-center gap-1 animate-fade-in mt-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Valid US phone number
                            </p>
                          )}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-4">
                    <legend className="text-lg font-semibold text-gray-900">
                      Address Information
                    </legend>

                    <div>
                      <FloatingInput
                        id="address.line1"
                        name="address.line1"
                        value={formData.address.line1}
                        onChange={handleInputChange}
                        required
                        label="Address Line 1"
                        icon={Building2}
                        autoComplete="address-line1"
                        aria-required="true"
                      />
                    </div>

                    <div>
                      <FloatingInput
                        id="address.line2"
                        name="address.line2"
                        value={formData.address.line2}
                        onChange={handleInputChange}
                        label="Address Line 2 (Optional)"
                        icon={Building2}
                        autoComplete="address-line2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <FloatingInput
                          id="address.locality"
                          name="address.locality"
                          value={formData.address.locality}
                          onChange={handleInputChange}
                          required
                          label="City"
                          icon={MapPin}
                          autoComplete="address-level2"
                          aria-required="true"
                        />
                      </div>
                      <div>
                        <FloatingSelect
                          id="address.majorAdminDivision"
                          name="address.majorAdminDivision"
                          value={formData.address.majorAdminDivision}
                          onValueChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                majorAdminDivision: value,
                              },
                            }));
                          }}
                          options={US_STATES}
                          required
                          label="State"
                          icon={Globe}
                        />
                      </div>
                      <div>
                        <FloatingInput
                          id="address.postalCode"
                          name="address.postalCode"
                          value={formData.address.postalCode}
                          onChange={handleInputChange}
                          required
                          label="Postal Code"
                          icon={MapPin}
                          maxLength={5}
                          autoComplete="postal-code"
                          inputMode="numeric"
                          pattern="[0-9]{5}"
                          aria-required="true"
                        />
                      </div>
                    </div>

                    <div>
                      <FloatingInput
                        id="address.minorAdminDivision"
                        name="address.minorAdminDivision"
                        value={formData.address.minorAdminDivision}
                        onChange={handleInputChange}
                        label="County/District (Optional)"
                        icon={MapPin}
                        autoComplete="address-level3"
                      />
                    </div>
                  </fieldset>
                  </CardContent>
                  <CardFooter className="pt-6">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-100 transition-all duration-200 cursor-pointer"
                      disabled={verificationMutation.isPending}
                    >
                      {verificationMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
