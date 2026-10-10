import React, { useEffect, useState } from "react";
import { toLocalDateTimeInput } from "../../utils/dateUtils";
import { Button, Input, Textarea } from "../ui";

const emptyForm = {
  pickupLocation: "",
  dropLocation: "",
  departureDateTime: "",
  totalSeats: 1,
  estimatedCost: "",
  description: "",
  phoneNumber: "",
};

const RideForm = ({ initialData, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        pickupLocation: initialData.pickupLocation || "",
        dropLocation: initialData.dropLocation || "",
        departureDateTime: toLocalDateTimeInput(initialData.departureDateTime),
        totalSeats: initialData.totalSeats || 1,
        estimatedCost: initialData.estimatedCost ?? "",
        description: initialData.description || "",
        phoneNumber: initialData.phoneNumber || "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pickupLocation.trim())
      newErrors.pickupLocation = "Where are you starting from?";

    if (!formData.dropLocation.trim())
      newErrors.dropLocation = "Where are you heading?";

    if (!formData.departureDateTime) {
      newErrors.departureDateTime = "Pick a departure time.";
    } else if (new Date(formData.departureDateTime) < new Date()) {
      newErrors.departureDateTime = "That time has already passed.";
    }

    if (!formData.totalSeats || formData.totalSeats < 1) {
      newErrors.totalSeats = "At least one seat.";
    } else if (formData.totalSeats > 8) {
      newErrors.totalSeats = "Eight seats is the maximum.";
    }

    if (formData.estimatedCost && formData.estimatedCost < 0)
      newErrors.estimatedCost = "Cost cannot be negative.";

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "A number is required so riders can reach you.";
    } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a 10-digit phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (validateForm()) {
      onSubmit({
        ...formData,
        departureDateTime: new Date(formData.departureDateTime).toISOString(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          name="pickupLocation"
          label="From"
          required
          value={formData.pickupLocation}
          onChange={handleChange}
          error={errors.pickupLocation}
          placeholder="e.g. Main gate"
        />
        <Input
          name="dropLocation"
          label="To"
          required
          value={formData.dropLocation}
          onChange={handleChange}
          error={errors.dropLocation}
          placeholder="e.g. Sonepat railway station"
        />
      </div>

      <Input
        name="departureDateTime"
        label="Departure"
        type="datetime-local"
        required
        value={formData.departureDateTime}
        onChange={handleChange}
        error={errors.departureDateTime}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          name="totalSeats"
          label="Seats available"
          type="number"
          min="1"
          max="8"
          required
          value={formData.totalSeats}
          onChange={handleChange}
          error={errors.totalSeats}
        />
        <Input
          name="estimatedCost"
          label="Cost per person"
          type="number"
          min="0"
          value={formData.estimatedCost}
          onChange={handleChange}
          error={errors.estimatedCost}
          placeholder="Optional"
          hint="In rupees"
        />
      </div>

      <Input
        name="phoneNumber"
        label="Phone number"
        required
        inputMode="numeric"
        value={formData.phoneNumber}
        onChange={handleChange}
        error={errors.phoneNumber}
        placeholder="10-digit mobile number"
      />

      <Textarea
        name="description"
        label="Notes"
        rows={3}
        value={formData.description}
        onChange={handleChange}
        placeholder="Anything useful — luggage space, exact meeting point, whether you are flexible on time."
      />

      <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData ? "Save changes" : "Offer ride"}
        </Button>
      </div>
    </form>
  );
};

export default RideForm;
