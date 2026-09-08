"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const pickupSchema = z.object({
  wasteType: z.string().min(1),
  weight: z.number().positive("Weight must be greater than zero"),
  address: z.string().min(8, "Address is too short"),
  description: z.string().optional(),
});

type PickupFormValues = z.infer<typeof pickupSchema>;

export function PickupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PickupFormValues>({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      wasteType: "PLASTIC",
      weight: 5,
      address: "",
      description: "",
    },
  });

  async function onSubmit(values: PickupFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Unable to create pickup");
      }

      toast.success("Pickup booked successfully");
      router.push("/pickup/history");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-0 shadow-lg shadow-emerald-100/60">
      <CardHeader>
        <CardTitle className="text-2xl">Book a pickup</CardTitle>
        <p className="text-sm text-slate-500">Schedule a collection for your recyclable waste.</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Waste type</label>
            <Select {...register("wasteType")}>
              <option value="PLASTIC">Plastic</option>
              <option value="PAPER">Paper</option>
              <option value="GLASS">Glass</option>
              <option value="METAL">Metal</option>
              <option value="EWASTE">E-waste</option>
              <option value="ORGANIC">Organic</option>
            </Select>
            {errors.wasteType ? <p className="mt-2 text-sm text-red-600">{errors.wasteType.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Weight (kg)</label>
            <Input type="number" step="0.1" {...register("weight")} />
            {errors.weight ? <p className="mt-2 text-sm text-red-600">{errors.weight.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
            <Textarea {...register("address")} placeholder="Enter your pickup location" />
            {errors.address ? <p className="mt-2 text-sm text-red-600">{errors.address.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
            <Textarea {...register("description")} placeholder="Optional description, contact details, or notes" />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : "Book pickup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
