
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export const CircleIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full bg-current ${className}`}></div>
);

export const SquareIcon = ({ className }: { className?: string }) => (
  <div className={`bg-current ${className}`}></div>
);

export const TriangleIcon = ({ className }: { className?: string }) => (
  <div className={`w-0 h-0 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-current ${className}`}></div>
);

export const HalfCircleIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-t-full bg-current ${className}`}></div>
);

export const RectIcon = ({ className }: { className?: string }) => (
  <div className={`bg-current w-full h-[4px] my-1 ${className}`}></div>
);

export const PlusIcon = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute w-full h-[2px] bg-current"></div>
    <div className="absolute h-full w-[2px] bg-current"></div>
  </div>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="w-[2px] h-[8px] bg-current"></div>
    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-current -mt-1"></div>
    <div className="w-4 h-[2px] bg-current mt-1"></div>
  </div>
);

export const getIcon = (type: string, className: string = "w-4 h-4") => {
  switch (type) {
    case 'circle': return <CircleIcon className={className} />;
    case 'triangle': return <TriangleIcon className={className} />;
    case 'square': return <SquareIcon className={className} />;
    case 'half-circle': return <HalfCircleIcon className={className} />;
    case 'rect': return <div className="flex flex-col gap-0.5"><RectIcon className="w-4" /><RectIcon className="w-4" /></div>;
    case 'plus': return <PlusIcon className={className} />;
    default: return <CircleIcon className={className} />;
  }
};

interface BauhausButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const BauhausButton: React.FC<BauhausButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon,
  className = '',
  ...props 
}) => {
  const baseClasses = "relative font-bold text-xs uppercase border-2 border-bauhaus-green p-2 transition-all active:scale-95 disabled:opacity-30";
  
  let colorClasses = "bg-black text-bauhaus-green hover:bg-bauhaus-green hover:text-black";
  if (variant === 'danger') colorClasses = "bg-black text-bauhaus-red border-bauhaus-red hover:bg-bauhaus-red hover:text-black";

  return (
    <button className={`${baseClasses} ${colorClasses} ${className}`} {...props}>
      <div className="flex items-center justify-center gap-2">
        {icon}
        {children}
      </div>
    </button>
  );
};
