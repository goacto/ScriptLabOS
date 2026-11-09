const outbound = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

const linkClass = "text-matrix hover:text-matrix-dim transition-colors";

/**
 * How ScriptLabOS sits next to GOACTO's other focus tools, plus the free guide.
 * Focus Log stays first and is named the main focus app.
 */
export default function EcosystemFooter() {
  return (
    <div className="mt-4 max-w-md mx-auto space-y-2 text-xs leading-relaxed text-ink/75">
      <p data-testid="goacto-cross-links">
        ScriptLabOS: build habits as code in a terminal-style OS. Want a simple
        daily focus tracker? Try{" "}
        <a
          href="https://focus.goacto.com"
          data-testid="focus-log-link"
          className={linkClass}
          {...outbound}
        >
          Focus Log
        </a>
        , <span className="whitespace-nowrap">the main focus app</span>.
      </p>
      <p>
        <a
          href="https://mindscape.goacto.com"
          data-testid="mindscape-link"
          className={linkClass}
          {...outbound}
        >
          Mindscape
        </a>{" "}
        — a focus game.
      </p>
      <p>
        <a
          href="https://goacto.com/pages/atomic-habits"
          data-testid="free-book-guide"
          className={linkClass}
          {...outbound}
        >
          Free one-page book guide
        </a>
      </p>
    </div>
  );
}
