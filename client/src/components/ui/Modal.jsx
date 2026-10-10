import React from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "./cn";
import IconButton from "./IconButton";

const sizes = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  "2xl": "sm:max-w-3xl",
};

const ease = [0.16, 1, 0.3, 1];

/**
 * The one modal in the app. Replaces three incompatible strategies (react-modal,
 * raw `fixed inset-0` divs, motion-wrapped raw divs) across twelve sites.
 *
 * Headless UI was already a dependency and imported nowhere; using it brings
 * the focus trap, Escape handling, scroll lock and ARIA wiring that none of
 * the hand-rolled overlays had. On small screens the panel becomes a bottom
 * sheet, which is what a full-height form actually needs on a phone.
 */
const Modal = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  showClose = true,
  panelClassName,
  children,
}) => (
  <AnimatePresence>
    {open && (
      <Dialog static open={open} onClose={onClose} className="relative z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
          aria-hidden
        />

        <div className="fixed inset-0 flex items-end justify-center overflow-y-auto sm:items-center sm:p-4">
          <DialogPanel
            as={motion.div}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease }}
            className={cn(
              "relative flex max-h-[92vh] w-full flex-col",
              "border border-line bg-surface shadow-overlay",
              "rounded-t-tile sm:rounded-card",
              sizes[size] || sizes.md,
              panelClassName
            )}
          >
            {/* Drag affordance for the mobile sheet. */}
            <div
              className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-line-3 sm:hidden"
              aria-hidden
            />

            {(title || showClose) && (
              <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  {title && (
                    <DialogTitle className="text-h4 text-ink">
                      {title}
                    </DialogTitle>
                  )}
                  {description && (
                    <p className="mt-1 text-meta text-ink-3">{description}</p>
                  )}
                </div>
                {showClose && (
                  <IconButton
                    icon={X}
                    label="Close"
                    size="sm"
                    onClick={onClose}
                    className="-mt-0.5 -mr-1.5"
                  />
                )}
              </header>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {children}
            </div>

            {footer && (
              <footer className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </footer>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    )}
  </AnimatePresence>
);

export default Modal;
