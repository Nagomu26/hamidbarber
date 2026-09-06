import type { CSSProperties, MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

export type DotBorderButtonVariant = "default" | "brass";
export type DotBorderButtonSize = "sm" | "md";

export interface DotBorderButtonProps {
  text?: string;
  href?: string;
  variant?: DotBorderButtonVariant;
  size?: DotBorderButtonSize;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  ariaLabel?: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

const variantStyles: Record<
  DotBorderButtonVariant,
  { vars: CSSProperties; button: string; icon: string }
> = {
  default: {
    vars: {
      "--dot-size": "8px",
      "--line-weight": "1px",
      "--animation-speed": "0.35s",
      "--dot-color": "rgba(255,255,255,0.8)",
      "--line-color": "rgba(255,255,255,0.8)",
      "--grid-color": "rgba(255,255,255,0.2)",
    } as CSSProperties,
    button:
      "bg-white/10 hover:bg-[#25358b] text-white/90 hover:text-white border-white/20",
    icon: "text-white/50",
  },
  brass: {
    vars: {
      "--dot-size": "8px",
      "--line-weight": "1px",
      "--animation-speed": "0.35s",
      "--dot-color": "rgba(233,193,122,0.9)",
      "--line-color": "rgba(184,134,59,0.9)",
      "--grid-color": "rgba(184,134,59,0.3)",
    } as CSSProperties,
    button:
      "bg-brass/10 hover:bg-brass/25 text-bone border-brass/30 hover:shadow-brassglow",
    icon: "text-brass/80",
  },
};

const sizeStyles: Record<DotBorderButtonSize, { wrapper: string; button: string }> = {
  md: { wrapper: "p-[0.8rem_1rem]", button: "px-5 py-3 text-base" },
  sm: { wrapper: "p-[0.45rem_0.65rem]", button: "px-4 py-2 text-sm" },
};

const baseButtonClasses =
  "relative flex items-center justify-center font-sans font-semibold tracking-tight hover:tracking-wider capitalize border rounded-md cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

function DotBorderButton({
  text = "Start Creating",
  href,
  variant = "default",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ariaLabel,
  target,
  rel,
  onClick,
}: DotBorderButtonProps) {
  const theme = variantStyles[variant];
  const sizing = sizeStyles[size];

  const content = (
    <>
      <span>{text}</span>
      <svg
        className={cn(
          "ml-2 h-6 w-6 stroke-[1] stroke-linecap-round stroke-linejoin-round fill-current stroke-current transition-all duration-200 opacity-90",
          theme.icon,
        )}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M17.6744 11.4075L15.7691 17.1233C15.7072 17.309 15.5586 17.4529 15.3709 17.5087L3.69348 20.9803C3.22819 21.1186 2.79978 20.676 2.95328 20.2155L6.74467 8.84131C6.79981 8.67588 6.92419 8.54263 7.08543 8.47624L12.472 6.25822C12.696 6.166 12.9535 6.21749 13.1248 6.38876L17.5294 10.7935C17.6901 10.9542 17.7463 11.1919 17.6744 11.4075Z"></path>
        <path d="M3.2959 20.6016L9.65986 14.2376"></path>
        <path d="M17.7917 11.0557L20.6202 8.22724C21.4012 7.44619 21.4012 6.17986 20.6202 5.39881L18.4989 3.27749C17.7178 2.49645 16.4515 2.49645 15.6704 3.27749L12.842 6.10592"></path>
        <path d="M11.7814 12.1163C11.1956 11.5305 10.2458 11.5305 9.66004 12.1163C9.07426 12.7021 9.07426 13.6519 9.66004 14.2376C10.2458 14.8234 11.1956 14.8234 11.7814 14.2376C12.3671 13.6519 12.3671 12.7021 11.7814 12.1163Z"></path>
      </svg>
    </>
  );

  const borderEffect = (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
      <div className="line horizontal top absolute h-[var(--line-weight)] w-full bg-[repeating-linear-gradient(90deg,#0000_0_calc(var(--line-weight)*2),var(--line-color)_calc(var(--line-weight)*2)_calc(var(--line-weight)*4))] top-[calc(var(--line-weight)*-0.5)] origin-top-left rotate-[5deg] scale-x-0 transition-all duration-300"></div>
      <div className="line vertical right absolute w-[var(--line-weight)] h-full bg-[repeating-linear-gradient(0deg,#0000_0_calc(var(--line-weight)*2),var(--line-color)_calc(var(--line-weight)*2)_calc(var(--line-weight)*4))] right-[calc(var(--line-weight)*-0.5)] origin-top-right rotate-[5deg] scale-y-0 transition-all duration-300"></div>
      <div className="line horizontal bottom absolute h-[var(--line-weight)] w-full bg-[repeating-linear-gradient(90deg,#0000_0_calc(var(--line-weight)*2),var(--line-color)_calc(var(--line-weight)*2)_calc(var(--line-weight)*4))] bottom-[calc(var(--line-weight)*-0.5)] origin-bottom-right rotate-[5deg] scale-x-0 transition-all duration-300"></div>
      <div className="line vertical left absolute w-[var(--line-weight)] h-full bg-[repeating-linear-gradient(0deg,#0000_0_calc(var(--line-weight)*2),var(--line-color)_calc(var(--line-weight)*2)_calc(var(--line-weight)*4))] left-[calc(var(--line-weight)*-0.5)] origin-bottom-left rotate-[0deg] scale-y-0 transition-all duration-300"></div>

      <div className="dot top left absolute w-[var(--dot-size)] aspect-square rounded-[2px] bg-[var(--dot-color)] opacity-0 transition-all duration-300"></div>
      <div className="dot top right absolute w-[var(--dot-size)] aspect-square rounded-[2px] bg-[var(--dot-color)] opacity-0 transition-all duration-300"></div>
      <div className="dot bottom right absolute w-[var(--dot-size)] aspect-square rounded-[2px] bg-[var(--dot-color)] opacity-0 transition-all duration-300"></div>
      <div className="dot bottom left absolute w-[var(--dot-size)] aspect-square rounded-[2px] bg-[var(--dot-color)] opacity-0 transition-all duration-300"></div>
    </div>
  );

  const elementClasses = cn(
    baseButtonClasses,
    sizing.button,
    theme.button,
  );

  const wrapperClasses = cn(
    "relative inline-flex items-center justify-center select-none",
    sizing.wrapper,
    className,
  );

  if (href) {
    return (
      <span className={wrapperClasses} style={{ ...theme.vars }}>
        {borderEffect}
        <a
          href={href}
          className={elementClasses}
          aria-label={ariaLabel}
          target={target}
          rel={rel}
          onClick={onClick}
        >
          {content}
        </a>
      </span>
    );
  }

  return (
    <span className={wrapperClasses} style={{ ...theme.vars }}>
      {borderEffect}
      <button
        type={type}
        className={elementClasses}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </button>
    </span>
  );
}

export default DotBorderButton;