import React, { useState, useCallback, useEffect } from 'react';
import InteractiveMap from '../map/InteractiveMap';
import { Square, Circle, Undo, Trash2, CheckSquare } from 'lucide-react';

const SNAP_THRESHOLD = 2.0; // Snap distance in percentage

const TombPositioner = ({ mapUrl, onPositionChange, initialCoordinates = [] }) => {
  const [drawingMode, setDrawingMode] = useState('point');
  const [currentPoints, setCurrentPoints] = useState(initialCoordinates);
  const [snapTarget, setSnapTarget] = useState(null);

  // Sync with external changes
  useEffect(() => {
    setCurrentPoints(initialCoordinates);
  }, [initialCoordinates]);

  const handleMouseMove = useCallback(({ x, y }) => {
    if (drawingMode !== 'polygon' || currentPoints.length < 2) {
      setSnapTarget(null);
      return;
    }
    
    // Check snap to first point
    const firstPoint = currentPoints[0];
    const distance = Math.sqrt(Math.pow(firstPoint.x - x, 2) + Math.pow(firstPoint.y - y, 2));
    
    if (distance < SNAP_THRESHOLD) {
      setSnapTarget(firstPoint);
    } else {
      setSnapTarget(null);
    }
  }, [drawingMode, currentPoints]);

  const handleMapClick = useCallback(({ x, y }) => {
    if (drawingMode === 'point') {
      const newPoint = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
      setCurrentPoints([newPoint]);
      onPositionChange([newPoint]);
      return;
    }

    // Polygon mode
    const newPoint = { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
    
    // Check if we should snap to close the polygon
    if (snapTarget && currentPoints.length >= 3) {
      // Close the polygon by using the first point
      const closedPolygon = [...currentPoints, currentPoints[0]];
      setCurrentPoints(closedPolygon);
      onPositionChange(closedPolygon);
      setSnapTarget(null);
      return;
    }
    
    // Add new point
    const newPoints = [...currentPoints, newPoint];
    setCurrentPoints(newPoints);
  }, [drawingMode, currentPoints, snapTarget, onPositionChange]);

  const handleUndo = useCallback(() => {
    if (currentPoints.length > 0) {
      const newPoints = currentPoints.slice(0, -1);
      setCurrentPoints(newPoints);
      setSnapTarget(null);
    }
  }, [currentPoints]);

  const handleClear = useCallback(() => {
    setCurrentPoints([]);
    setSnapTarget(null);
    onPositionChange([]);
  }, [onPositionChange]);

  const handleSave = useCallback(() => {
    if (currentPoints.length > 0) {
      onPositionChange(currentPoints);
    }
  }, [currentPoints, onPositionChange]);
  
  const ModeButton = ({ mode, label, icon: Icon }) => (
    <button 
      type="button" 
      onClick={() => {
        setDrawingMode(mode);
        setCurrentPoints([]);
        setSnapTarget(null);
      }} 
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        drawingMode === mode 
          ? 'bg-emerald-600 text-white shadow' 
          : 'bg-white hover:bg-gray-100 text-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Modalità:</span>
          <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-lg">
            <ModeButton mode="point" label="Punto" icon={Circle} />
            <ModeButton mode="polygon" label="Poligono" icon={Square} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={handleUndo} 
            disabled={currentPoints.length === 0}
            className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Annulla ultimo punto"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            onClick={handleClear} 
            disabled={currentPoints.length === 0}
            className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Pulisci tutto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={currentPoints.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" 
            title="Salva forma"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Applica Forma</span>
          </button>
        </div>
      </div>
      
      <InteractiveMap
        mapUrl={mapUrl}
        tombs={[]}
        isEditable={true}
        onMapClick={handleMapClick}
        onMouseMove={handleMouseMove}
        activeShape={currentPoints}
        drawingMode={drawingMode}
        snapTarget={snapTarget}
        className="min-h-[500px] border-dashed border-gray-300 hover:border-emerald-400"
      />

      {currentPoints.length > 0 && (
        <div className={`p-3 rounded-lg border transition-colors ${
          snapTarget 
            ? 'bg-green-100 border-green-300' 
            : 'bg-emerald-50 border-emerald-200'
        }`}>
          <p className={`text-sm ${
            snapTarget 
              ? 'text-green-800 font-medium' 
              : 'text-emerald-800'
          }`}>
            {snapTarget 
              ? '🎯 Agganciato al primo punto! Clicca per chiudere il poligono.' 
              : `📍 ${currentPoints.length} ${currentPoints.length === 1 ? 'punto' : 'punti'} disegnati.`
            }
            {drawingMode === 'polygon' && currentPoints.length >= 3 && !snapTarget && (
              <span className="block mt-1 text-xs">
                Avvicinati al primo punto (verde) per chiudere automaticamente.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(TombPositioner);