import React from "react";
import RideForm from "./RideForm";
import { Modal } from "../ui";

const RideFormModal = ({
  isOpen,
  editingRide,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => (
  <Modal
    open={isOpen}
    onClose={isSubmitting ? () => {} : onCancel}
    size="lg"
    title={editingRide ? "Edit ride" : "Offer a ride"}
    description={
      editingRide
        ? "Update the details of this ride."
        : "Say where you are going and when, and others can split the fare."
    }
  >
    <RideForm
      initialData={editingRide}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  </Modal>
);

export default RideFormModal;
