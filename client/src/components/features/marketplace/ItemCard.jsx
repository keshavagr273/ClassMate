import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Expand,
  Heart,
  Pencil,
  Phone,
  Share2,
  Trash2,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { deleteItem } from "../../../slices/buyandsellSlice";
import { Badge, Button, Card, IconButton, Modal } from "../../ui";

/** Strips anything that looks like a pasted SQL query out of a description. */
const sanitizeDescription = (text) => {
  if (!text) return "";
  if (/SELECT|INSERT|UPDATE|DELETE.*FROM/i.test(text))
    return "No description available";
  return text;
};

function ItemCard({ item, onEdit }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isLiked, setIsLiked] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === item.userId;
  const isAdmin = user?.roles?.includes("admin");
  const canModify = isOwner || isAdmin;

  const listed =
    item.createdAt && isValid(parseISO(item.createdAt))
      ? format(parseISO(item.createdAt), "d MMM yyyy")
      : null;

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteItem(item.id)).unwrap();
      toast.success("Listing removed.");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error(
        `Could not remove that listing. ${error?.message || ""}`.trim()
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    const payload = {
      title: item.item_name,
      text: `${item.item_name} — ₹${item.price}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied.");
      }
    } catch {
      /* the user dismissed the share sheet */
    }
  };

  return (
    <>
      <Card padding="none" interactive className="group flex flex-col overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          {item.image_url ? (
            <>
              <img
                src={item.image_url}
                alt={item.item_name}
                loading="lazy"
                className="size-full object-cover opacity-85 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
                <IconButton
                  icon={Expand}
                  label="View larger"
                  variant="subtle"
                  size="sm"
                  onClick={() => setShowImageModal(true)}
                />
              </div>
            </>
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="text-micro text-ink-4">No photo</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="min-w-0 flex-1 truncate text-h4 text-ink"
              title={item.item_name}
            >
              {item.item_name}
            </h3>
            <span className="numeric shrink-0 font-display text-h4 font-bold text-ink">
              ₹{item.price}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {item.category && <Badge>{item.category}</Badge>}
            {item.item_condition && (
              <Badge tone="accent">{item.item_condition}</Badge>
            )}
          </div>

          {item.description && (
            <p className="line-clamp-2 text-meta text-ink-3">
              {sanitizeDescription(item.description)}
            </p>
          )}

          {listed && (
            <p className="text-micro text-ink-4">
              Listed <time className="numeric">{listed}</time>
            </p>
          )}

          <div className="mt-auto flex items-center gap-1.5 border-t border-line pt-4">
            {showContact && item.owner_contact ? (
              <Button
                as="a"
                href={`tel:${item.owner_contact}`}
                size="sm"
                leadingIcon={Phone}
              >
                {item.owner_contact}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                leadingIcon={Phone}
                onClick={() => setShowContact(true)}
              >
                Show contact
              </Button>
            )}

            <div className="ml-auto flex items-center gap-0.5">
              <IconButton
                icon={Heart}
                label={isLiked ? "Remove from saved" : "Save"}
                size="sm"
                onClick={() => setIsLiked((prev) => !prev)}
                className={isLiked ? "text-clay-soft" : undefined}
              />
              <IconButton
                icon={Share2}
                label="Share"
                size="sm"
                onClick={handleShare}
              />
              {canModify && (
                <>
                  <IconButton
                    icon={Pencil}
                    label="Edit listing"
                    size="sm"
                    onClick={() => onEdit?.(item)}
                  />
                  <IconButton
                    icon={Trash2}
                    label="Remove listing"
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* These two modals used to be ~90 lines duplicated verbatim between
          this file and LostItemCard. */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
        title="Remove this listing?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={handleDeleteConfirm}
            >
              Remove
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-clay-soft"
            aria-hidden
          />
          <p className="text-ui text-ink-2">
            <span className="text-ink">{item.item_name}</span> will be removed
            from the marketplace. This cannot be undone.
          </p>
        </div>
      </Modal>

      <Modal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        size="2xl"
        title={item.item_name}
      >
        <img
          src={item.image_url}
          alt={item.item_name}
          className="max-h-[70vh] w-full rounded-card object-contain"
        />
      </Modal>
    </>
  );
}

export default ItemCard;
