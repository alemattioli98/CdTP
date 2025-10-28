import React, { useState, useRef, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TombIcon from "../icons/TombIcon"; // Assuming this is for the popup

export default function InteractiveMap({ 
  mapUrl, 
  tombs = [], 
  isEditable = false,
  activeShape = [],
  isStatic = false,
  initialZoom = 1,
  initialPosition = null,
  className = "",
  drawingMode = 'point',
  onMapClick,
  onMouseMove,
  snapTarget = null
}) {
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMoved, setDragMoved] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // State for the hover tooltip
  const [hoveredTomb, setHoveredTomb] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getCentroid = (points = []) => {
    if (!points || points.length === 0) return null;
    if (points.length === 1) return points[0];
    let x = 0, y = 0;
    for (let i = 0; i < points.length; i++) {
        x += points[i].x;
        y += points[i].y;
    }
    return { x: x / points.length, y: y / points.length };
  };

  useEffect(() => {
    if (isStatic && initialPosition && imageRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const newX = -((initialPosition.x / 100) * containerWidth * zoom - containerWidth / 2);
        const newY = -((initialPosition.y / 100) * containerHeight * zoom - containerHeight / 2);
        setPosition({ x: newX, y: newY });
    }
  }, [isStatic, initialPosition, zoom]);

  const handleZoom = useCallback((delta) => {
    setZoom(prevZoom => Math.max(0.5, Math.min(5, prevZoom * delta)));
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 0.9 : 1.1;
    handleZoom(scale);
  }, [handleZoom]);

  const handleZoomIn = () => handleZoom(1.5);
  const handleZoomOut = () => handleZoom(0.75);
  const handleReset = () => { setZoom(1); setPosition({ x: 0, y: 0 }); };

  const handleMouseDown = useCallback((e) => {
    if (isStatic || isEditable) return;
    setIsDragging(true);
    setDragMoved(false);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [isStatic, isEditable, position]);

  const handleGlobalMouseMove = useCallback((e) => {
    if (isDragging && !isStatic && !isEditable) {
      setDragMoved(true);
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, isStatic, isEditable, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleContainerClick = useCallback((e) => {
    if (!onMapClick || !isEditable || !imageRef.current) return;
    if (isDragging && dragMoved) return;
    
    e.stopPropagation();
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onMapClick({ x, y });
  }, [onMapClick, isEditable, isDragging, dragMoved]);

  const handleContainerMouseMove = (e) => {
    // For drawing mode
    if (onMouseMove && isEditable && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        onMouseMove({ x, y });
    }
    // For tooltip positioning
    if (hoveredTomb && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const mouseUpListener = () => handleMouseUp();
    const mouseMoveListener = (e) => handleGlobalMouseMove(e);
    
    if (!isStatic) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    document.addEventListener('mousemove', mouseMoveListener);
    document.addEventListener('mouseup', mouseUpListener);
    
    return () => {
      if (!isStatic && container) {
        container.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);
    };
  }, [isStatic, handleWheel, handleGlobalMouseMove, handleMouseUp]);

  return (
    <div className={`relative bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden ${className}`}>
      {/* ... (zoom buttons remain the same) ... */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <button type="button" onClick={handleZoomIn} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors" title="Zoom In">
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button type="button" onClick={handleZoomOut} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors" title="Zoom Out">
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <button type="button" onClick={handleReset} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors" title="Reset View">
            <RotateCcw className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        onMouseDown={handleMouseDown}
        onClick={handleContainerClick}
        onMouseMove={handleContainerMouseMove}
        style={{ 
          cursor: isDragging ? 'grabbing' : (isEditable ? 'crosshair' : 'grab'), 
          minHeight: isStatic ? 'auto' : '600px' 
        }}
      >
        <div
          className="relative origin-top-left"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            willChange: 'transform'
          }}
        >
          <img 
            ref={imageRef} 
            src={mapUrl} 
            alt="Pianta della Necropoli" 
            className="w-full h-auto block select-none" 
            draggable={false} 
          />
          
          <svg 
            className="absolute top-0 left-0 w-full h-full pointer-events-none" 
            style={{ width: '100%', height: '100%' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Render existing tombs */}
            {tombs.map(tomb => {
              if (!tomb.shape_coordinates || tomb.shape_coordinates.length === 0) return null;
              const isPoint = tomb.shape_coordinates.length === 1;

              return (
                <g 
                  key={tomb.id} 
                  className="group"
                  onMouseEnter={() => setHoveredTomb(tomb)}
                  onMouseLeave={() => setHoveredTomb(null)}
                >
                  <Link to={createPageUrl(`TombDetail?id=${tomb.id}`)} className="pointer-events-auto">
                    {isPoint ? (
                      <circle 
                        cx={tomb.shape_coordinates[0].x} 
                        cy={tomb.shape_coordinates[0].y} 
                        r={0.3}
                        className="fill-red-600 stroke-white group-hover:fill-red-500" 
                        strokeWidth={0.1}
                      />
                    ) : (
                      <polygon 
                        points={tomb.shape_coordinates.map(p => `${p.x},${p.y}`).join(' ')} 
                        className="fill-red-600/40 stroke-red-700 group-hover:fill-red-500/60 pointer-events-auto" 
                        strokeWidth={0.2}
                      />
                    )}
                  </Link>
                </g>
              );
            })}
            
            {/* Render active drawing shape (unchanged) */}
            {isEditable && activeShape.length > 0 && (
              <g>
                {drawingMode === 'polygon' ? (
                  <>
                    <polygon points={activeShape.map(p => `${p.x},${p.y}`).join(' ')} className="fill-blue-500/30 stroke-blue-600" strokeWidth={0.2} strokeDasharray="0.5,0.5" />
                    {activeShape.map((p, i) => (<circle key={i} cx={p.x} cy={p.y} r={0.3} className={`stroke-blue-600 ${i === 0 ? 'fill-green-400' : 'fill-white'}`} strokeWidth={0.15}/>))}
                    {snapTarget && (<circle cx={snapTarget.x} cy={snapTarget.y} r={0.8} className="fill-none stroke-green-500 animate-pulse" strokeWidth={0.2} />)}
                  </>
                ) : (
                  <circle cx={activeShape[0].x} cy={activeShape[0].y} r={0.4} className="fill-blue-500/80 stroke-blue-700" strokeWidth={0.15} />
                )}
              </g>
            )}
          </svg>
        </div>
      </div>
      
      {/* Tooltip Popup */}
      {hoveredTomb && !isEditable && (
        <div 
          className="absolute z-30 p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl pointer-events-none transition-opacity duration-200 animate-fade-in"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(15px, 15px)', // Offset from cursor
            maxWidth: '250px'
          }}
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg mt-1">
                    <TombIcon className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{hoveredTomb.Nome || `Tomba ${hoveredTomb.Numero_tomba}`}</h4>
                    <p className="text-sm text-gray-600">{hoveredTomb.datazione}</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}