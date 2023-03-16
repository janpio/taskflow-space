import { IconType } from "react-icons";
import { FiExternalLink } from "react-icons/fi";

function PrimaryLinkButton({
  children,
  className,
  href,
  LeftIcon,
  RightIcon,
  isExternal,
  ...rest
}: {
  children: any;
  href: string;
  className?: string;
  LeftIcon?: IconType;
  RightIcon?: IconType;
  isExternal?: boolean;
}) {
  return (
    <a
      className={`block w-full rounded-full bg-accent py-3 px-5 text-center font-semibold text-brand-dark md:py-3 md:px-10 ${className}`}
      {...rest}
      href={href}
    >
      <div className="flex items-center justify-center gap-3">
        {LeftIcon && <LeftIcon className="text-inherit" />}
        {children}
        {RightIcon && <RightIcon className="text-inherit" />}
        {isExternal && <FiExternalLink className="text-inherit" />}
      </div>
    </a>
  );
}

export default PrimaryLinkButton;
