import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge does not know about the custom scales declared in index.css.
 * Without this, `text-h2` and `text-ink` look like the same class group to it
 * and one silently drops the other. Register the custom names explicitly.
 */
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "eyebrow",
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "lead",
            "body",
            "ui",
            "meta",
            "micro",
          ],
        },
      ],
      rounded: [{ rounded: ["card", "tile", "input", "chip"] }],
      shadow: [{ shadow: ["overlay", "pop"] }],
    },
  },
});

export const cn = (...inputs) => merge(clsx(inputs));

export default cn;
