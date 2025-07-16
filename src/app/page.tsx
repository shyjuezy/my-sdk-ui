"use client";

import { useState } from "react";
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
import { startVerification } from "@/app/actions/verify";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
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

export default function Home() {
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    middleName: "",
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
    onSuccess: (response) => {
      if (response.success) {
        alert('Verification started successfully!');
        console.log('Verification response:', response.data);
        // Optionally clear the form
        // setFormData({ ...initialFormData });
      } else {
        if (response.statusCode === 401) {
          alert(`Authentication failed: ${response.error}`);
        } else if (response.statusCode === 400) {
          alert(`Invalid request: ${response.error}\nPlease check your input data.`);
        } else {
          alert(`Error: ${response.error}`);
        }
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      alert('An unexpected error occurred. Please try again.');
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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Use the mutation to submit the form
    verificationMutation.mutate({
      customerInfo: formData
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Identity Verification</h1>
          <Link href="/testing">
            <Button variant="outline">Go to Testing Page</Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              Please fill in your information to start the verification process.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Michael"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>

                <div className="space-y-2">
                  <Label htmlFor="address.line_1">Address Line 1 *</Label>
                  <Input
                    id="address.line_1"
                    name="address.line_1"
                    value={formData.address.line_1}
                    onChange={handleInputChange}
                    required
                    placeholder="200 Key Square St"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.line_2">Address Line 2</Label>
                  <Input
                    id="address.line_2"
                    name="address.line_2"
                    value={formData.address.line_2}
                    onChange={handleInputChange}
                    placeholder="Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address.locality">City *</Label>
                    <Input
                      id="address.locality"
                      name="address.locality"
                      value={formData.address.locality}
                      onChange={handleInputChange}
                      required
                      placeholder="New York City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address.major_admin_division">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address.postal_code">Postal Code *</Label>
                    <Input
                      id="address.postal_code"
                      name="address.postal_code"
                      value={formData.address.postal_code}
                      onChange={handleInputChange}
                      required
                      placeholder="12345"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address.minor_admin_division">
                    County/District
                  </Label>
                  <Input
                    id="address.minor_admin_division"
                    name="address.minor_admin_division"
                    value={formData.address.minor_admin_division}
                    onChange={handleInputChange}
                    placeholder="Manhattan"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={verificationMutation.isPending}>
                {verificationMutation.isPending ? "Starting Verification..." : "Start Verification"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
