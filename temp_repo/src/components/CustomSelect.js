import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, currentTheme, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 text-base rounded-2xl focus:outline-none shadow-sm flex items-center justify-between transition-colors ${
          currentTheme === 'princess' ? 'bg-[#FFF0F5] text-[#FF6B81] font-bold border border-pink-100' :
          currentTheme === 'excel' ? 'bg-white text-slate-800 border border-[#D1D1D1]' :
          'bg-[#2D2D30] text-[#D4D4D4] border border-[#3E3E42]'
        }`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${currentTheme === 'princess' ? 'text-pink-300' : 'text-slate-400'}`} />
      </button>

      {/* Dropdown Menu (Pops up above the select) */}
      {isOpen && (
        <div className={`absolute left-0 right-0 bottom-full mb-2 z-[100] rounded-2xl shadow-xl overflow-hidden border animate-in fade-in zoom-in-95 duration-150 ${
          currentTheme === 'princess' ? 'bg-white border-pink-200' :
          currentTheme === 'excel' ? 'bg-white border-[#D1D1D1]' :
          'bg-[#252526] border-[#3E3E42]'
        }`}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-4 flex items-center justify-between transition-colors ${
                  String(value) === String(opt.value) ? (
                    currentTheme === 'princess' ? 'bg-[#FFF0F5] text-[#FF6B81] font-bold' :
                    currentTheme === 'excel' ? 'bg-[#E2F0D9] text-[#107C41] font-bold' :
                    'bg-[#007ACC]/20 text-white font-bold'
                  ) : (
                    currentTheme === 'princess' ? 'text-slate-600 hover:bg-pink-50' :
                    currentTheme === 'excel' ? 'text-slate-700 hover:bg-slate-50' :
                    'text-[#D4D4D4] hover:bg-[#3E3E42]'
                  )
                }`}
              >
                <span>{opt.label}</span>
                {String(value) === String(opt.value) && (
                  <Check className={`w-5 h-5 ${
                    currentTheme === 'princess' ? 'text-[#FF6B81]' :
                    currentTheme === 'excel' ? 'text-[#107C41]' :
                    'text-[#007ACC]'
                  }`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
