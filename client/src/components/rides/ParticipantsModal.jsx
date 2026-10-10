import React from "react";
import { User } from "lucide-react";
import { Modal } from "../ui";

const ParticipantsModal = ({ isOpen, onClose, participants = [] }) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    size="lg"
    title="Who is riding"
    description={`${participants.length} ${
      participants.length === 1 ? "person has" : "people have"
    } joined`}
  >
    {participants.length === 0 ? (
      <p className="text-ui text-ink-4">Nobody has joined yet.</p>
    ) : (
      <ul className="border-t border-line">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className="flex items-center gap-3 border-b border-line py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line-2 bg-surface-2 text-ink-3">
              <User className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-ui text-ink">
                {participant.participant?.name ||
                  participant.participant?.email}
              </p>
              {participant.participant?.name && (
                <p className="truncate text-micro text-ink-4">
                  {participant.participant.email}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </Modal>
);

export default ParticipantsModal;
