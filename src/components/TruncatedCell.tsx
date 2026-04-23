import React from 'react';

interface Props {
  text: string;
  limit: number;
  className?: string;
}

export default function TruncatedCell({ text, limit, className = '' }: Props) {
  const isTruncated = text.length > limit;
  const displayText = isTruncated ? `${text.slice(0, limit)}...` : text;

  return (
    <div className={`group relative inline-block ${className}`}>
      <span className="truncate block" title={isTruncated ? text : undefined}>
        {displayText}
      </span>
      
      {/* Custom smooth tooltip */}
      {isTruncated && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-30">
          <div className="bg-slate-800 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-normal break-words max-w-[300px] border border-slate-700/50 backdrop-blur-md animate-in fade-in zoom-in duration-200">
            {text}
            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-800" />
          </div>
        </div>
      )}
    </div>
  );
}
