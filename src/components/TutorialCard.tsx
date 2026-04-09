import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface TutorialCardProps {
  title: string;
  content: React.ReactNode;
  explanation?: React.ReactNode;
}

export function TutorialCard({ title, content, explanation }: TutorialCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl active:scale-95 transition-transform overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-blue-100 text-blue-900 font-bold text-sm"
      >
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" />
          {title}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      {isOpen && (
        <div className="p-3 text-sm text-blue-800 space-y-3">
          <div>
            {content}
          </div>
          {explanation && (
            <div>
              <h4 className="font-bold mb-1">Fanazavana:</h4>
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
