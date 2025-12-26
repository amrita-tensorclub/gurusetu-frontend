import React from 'react';

const InteractiveMap = ({ coordinates, isSelected, cabinCode }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-5">
      
      {/* MAP WRAPPER: Relative positioning context for the pins */}
      <div className="relative w-full">
        
        {/* THE IMAGE: Use a real img tag so the div wraps it exactly. 
            No more 'aspect-ratio' mismatches. */}
        <img 
          src="/maps/AB3-First-Floor.jpeg" 
          alt="Floor Map"
          className="w-full h-auto block" // h-auto ensures it scales naturally
        />

        {/* PIN LAYER: Now positioned relative to the image pixels exactly */}
        {isSelected && coordinates && (
          <>
            {/* Pulsing Red Dot */}
            <div 
              className="absolute w-4 h-4 bg-amrita-maroon rounded-full shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500"
              style={{ top: `${coordinates.top}%`, left: `${coordinates.left}%` }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            </div>
            
            {/* Floating Label */}
            <div 
              className="absolute bg-white px-2 py-0.5 text-[10px] font-bold text-amrita-maroon shadow-lg rounded border border-gray-100 z-30 whitespace-nowrap transform -translate-x-1/2 -mt-8"
              style={{ top: `${coordinates.top}%`, left: `${coordinates.left}%` }}
            >
              {cabinCode || "Target"}
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
            </div>
          </>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-gray-200 text-[10px] text-gray-500 shadow-sm pointer-events-none">
          Academic Block III
        </div>

      </div>
    </div>
  );
};

export default InteractiveMap;