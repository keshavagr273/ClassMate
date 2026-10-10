import React, { useState } from "react";
import { Expand, MapPin, Pencil, Phone } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { Badge, Button, Card, IconButton, Modal } from "../../ui";

/**
 * Lost-and-found item card, rebuilt on the primitive layer.
 *
 * The previous version of this file was 425 lines, was imported by
 * LostAndFound.jsx but never rendered, and carried ~90 lines duplicated
 * verbatim from ItemCard (delete-confirm and image-lightbox modals). The page
 * inlined its own card markup instead. This is the richer card restored, with
 * the duplication gone.
 */
const LostItemCard = ({ item, onEdit, canEdit }) => {
  const [zoomed, setZoomed] = useState(false);

  const reported =
    item.createdAt && isValid(parseISO(item.createdAt))
      ? format(parseISO(item.createdAt), "d MMM yyyy")
      : null;

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
                  onClick={() => setZoomed(true)}
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
            <h3 className="min-w-0 flex-1 truncate text-h4 text-ink" title={item.item_name}>
              {item.item_name}
            </h3>
            {item.category && <Badge>{item.category}</Badge>}
          </div>

          {item.description && (
            <p className="line-clamp-2 text-meta text-ink-3">
              {item.description}
            </p>
          )}

          <dl className="flex flex-col gap-1.5 border-t border-line pt-3 text-meta">
            {item.location_found && (
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0 text-ink-4" aria-hidden />
                <dt className="sr-only">Found at</dt>
                <dd className="truncate text-ink-2">{item.location_found}</dd>
              </div>
            )}
            {reported && (
              <div className="flex items-center gap-2">
                <dt className="text-ink-4">Reported</dt>
                <dd className="ml-auto">
                  <time className="numeric text-ink-2">{reported}</time>
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-auto flex items-center gap-2 pt-2">
            {item.owner_contact && (
              <Button
                as="a"
                href={`tel:${item.owner_contact}`}
                variant="outline"
                size="sm"
                leadingIcon={Phone}
              >
                Contact
              </Button>
            )}
            {canEdit && (
              <IconButton
                icon={Pencil}
                label="Edit this report"
                size="sm"
                onClick={() => onEdit?.(item)}
                className="ml-auto"
              />
            )}
          </div>
        </div>
      </Card>

      <Modal
        open={zoomed}
        onClose={() => setZoomed(false)}
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
};

export default LostItemCard;
