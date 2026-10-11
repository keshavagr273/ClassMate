import React from "react";
import { Link } from "react-router-dom";
import { Eyebrow } from "./ui";

/**
 * Student spotlight card. Despite the name there was never a spotlight effect;
 * it was a plain card mixing two palettes, with a `transition-shadow` that had
 * no hover shadow to transition to. Now a hairline surface with a
 * full-colour image that eases in on hover.
 */
const SpotlightCard = ({ image, title, subtitle, description, link }) => (
  <Link
    to={link}
    className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors duration-200 ease-standard hover:border-line-3"
  >
    <div className="aspect-[16/10] overflow-hidden bg-surface-2">
      <img
        src={image}
        alt=""
        loading="lazy"
        // decoding="async" keeps image decode off the critical path, so a
        // large photo cannot stall the frame as the card scrolls in.
        decoding="async"
        width={720}
        height={450}
        className="size-full object-cover transition-transform duration-500 ease-standard group-hover:scale-[1.03]"
      />
    </div>

    <div className="flex flex-1 flex-col gap-2 p-5">
      <Eyebrow>{subtitle}</Eyebrow>
      <h3 className="text-h4 text-ink">{title}</h3>
      <p className="text-meta text-ink-3">{description}</p>
      <span className="mt-auto pt-3 text-meta text-ink-4 transition-colors duration-200 group-hover:text-accent">
        Read more &rarr;
      </span>
    </div>
  </Link>
);

export default SpotlightCard;
