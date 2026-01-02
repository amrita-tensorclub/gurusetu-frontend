import React from 'react';

interface Coordinates {
  top: number;
  left: number;
}

interface MapProps {
  coordinates?: Coordinates;
  cabinCode?: string;
}

const InteractiveMap: React.FC<MapProps> = ({ coordinates, cabinCode }) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
      <div className="relative w-full">
        {/* Map Image */}
        <img 
          src="/maps/AB3-First-Floor.jpeg" 
          alt="Floor Map"
          className="w-full h-auto block opacity-90" 
        />

        {/* Red Dot Indicator */}
        {coordinates && (
          <>
            <div 
              className="absolute w-4 h-4 bg-[#8C1515] rounded-full shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ top: `${coordinates.top}%`, left: `${coordinates.left}%` }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            </div>
            
            {/* Tooltip */}
            <div 
              className="absolute bg-white px-2 py-1 text-[10px] font-bold text-[#8C1515] shadow-lg rounded border border-gray-100 z-30 whitespace-nowrap transform -translate-x-1/2 -mt-9"
              style={{ top: `${coordinates.top}%`, left: `${coordinates.left}%` }}
            >
              {cabinCode || "Target"}
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
            </div>
          </>
        )}
      </div>
      <div className="p-2 bg-gray-50 text-[10px] text-gray-500 text-center font-bold">
        Academic Block III - 1st Floor
      </div>
    </div>
  );
};

export default InteractiveMap;