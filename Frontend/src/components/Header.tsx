import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: ReactNode;
  alignLeft?: boolean;
  titleClassName?: string;
}

export default function Header({ title, showBack = false, onBack, rightElement, alignLeft = false, titleClassName = '' }: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100 w-full flex justify-center">
      <div className="flex items-center justify-between p-4 px-5 md:px-6 layout-container">
        {showBack ? (
          <button
            onClick={handleBack}
            className="p-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center h-10 w-10 flex-shrink-0 -ml-2"
          >
            <span className="icon-arrow-left text-xl"></span>
          </button>
        ) : (
          !alignLeft && <div className="w-10 h-10 flex-shrink-0" />
        )}

        <h1 className={`flex-1 ${alignLeft ? 'text-left pl-2 text-2xl text-(--primary) font-extrabold' : 'text-center text-[19px] font-bold text-gray-800'} truncate px-2 ${titleClassName}`}>
          {title}
        </h1>

        {rightElement ? (
          <div className="flex-shrink-0 flex items-center justify-center -mr-2">
            {rightElement}
          </div>
        ) : (
          !alignLeft && <div className="w-10 h-10 flex-shrink-0" />
        )}
      </div>
    </header>
  );
}
