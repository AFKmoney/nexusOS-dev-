import { forwardRef } from 'react';

type IconProps = {
  size?: number | string;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
};

export const XLogo = forwardRef<SVGSVGElement, IconProps>(function XLogo(
  { size = 24, className, color = 'currentColor', style },
  ref
) {
  const dim = typeof size === 'number' ? size : 24;
  return (
    <svg
      ref={ref}
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.726-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
});
