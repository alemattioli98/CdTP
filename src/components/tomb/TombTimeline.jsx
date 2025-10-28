
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, Package, Calendar, Eye, Palette, Filter } from 'lucide-react';

// Funzione per convertire qualsiasi definizione cronologica in range di anni
const parseDatingToYearRange = (datingString) => {
    if (!datingString || typeof datingString !== 'string') return null;
    
    const text = datingString.toLowerCase().trim();
    
    const rangeMatch = text.match(/(\d{3,4})\s*[-–]\s*(\d{3,4})\s*a\.?c\.?/);
    if (rangeMatch) {
        const year1 = parseInt(rangeMatch[1]);
        const year2 = parseInt(rangeMatch[2]);
        return { startYear: Math.max(year1, year2), endYear: Math.min(year1, year2) };
    }
    
    const singleYearMatch = text.match(/(\d{3,4})\s*a\.?c\.?/);
    if (singleYearMatch) {
        const year = parseInt(singleYearMatch[1]);
        return { startYear: year + 5, endYear: year - 5 };
    }
    
    if (text.includes('terzo quarto vii')) return { startYear: 650, endYear: 625 };
    if (text.includes('ultimo quarto vii')) return { startYear: 625, endYear: 600 };
    if (text.includes('seconda metà vii')) return { startYear: 650, endYear: 600 };
    if (text.includes('primo quarto vi')) return { startYear: 600, endYear: 575 };
    if (text.includes('secondo quarto vi')) return { startYear: 575, endYear: 550 };
    if (text.includes('terzo quarto vi')) return { startYear: 550, endYear: 525 };
    if (text.includes('ultimo quarto vi')) return { startYear: 525, endYear: 500 };
    if (text.includes('prima metà vi')) return { startYear: 600, endYear: 550 };
    if (text.includes('seconda metà vi')) return { startYear: 550, endYear: 500 };
    if (text.includes('vi secolo')) return { startYear: 600, endYear: 500 };
    if (text.includes('primo quarto v')) return { startYear: 500, endYear: 475 };
    if (text.includes('secondo quarto v')) return { startYear: 475, endYear: 450 };
    if (text.includes('terzo quarto v')) return { startYear: 450, endYear: 425 };
    if (text.includes('ultimo quarto v')) return { startYear: 425, endYear: 400 };
    if (text.includes('prima metà v')) return { startYear: 500, endYear: 450 };
    if (text.includes('seconda metà v')) return { startYear: 450, endYear: 400 };
    
    return null;
};

const PIXELS_PER_YEAR = 6;
const MIN_TIMELINE_WIDTH = 1000;
const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 80;

export default function TombTimeline({ artifacts }) {
    const [viewMode, setViewMode] = useState('material');
    
    const timelineData = useMemo(() => {
        if (!artifacts || !Array.isArray(artifacts) || artifacts.length === 0) {
            return { 
                processedArtifacts: [], 
                timelineStart: 600, 
                timelineEnd: 500, 
                totalWidth: MIN_TIMELINE_WIDTH 
            };
        }

        const processedArtifacts = [];
        
        artifacts.forEach((artifact, index) => {
            const yearRange = parseDatingToYearRange(artifact.dating);
            if (yearRange) {
                processedArtifacts.push({
                    ...artifact,
                    yearRange,
                    rowIndex: index
                });
            }
        });

        if (processedArtifacts.length === 0) {
            return { 
                processedArtifacts: [], 
                timelineStart: 600, 
                timelineEnd: 500, 
                totalWidth: MIN_TIMELINE_WIDTH 
            };
        }
        
        processedArtifacts.sort((a, b) => b.yearRange.startYear - a.yearRange.startYear);
        processedArtifacts.forEach((artifact, index) => {
            artifact.rowIndex = index;
        });

        const allStartYears = processedArtifacts.map(a => a.yearRange.startYear);
        const allEndYears = processedArtifacts.map(a => a.yearRange.endYear);
        const timelineStart = Math.max(...allStartYears) + 25;
        const timelineEnd = Math.min(...allEndYears) - 25;
        
        const totalYearSpan = timelineStart - timelineEnd;
        const totalWidth = Math.max(MIN_TIMELINE_WIDTH, totalYearSpan * PIXELS_PER_YEAR);

        return {
            processedArtifacts,
            timelineStart,
            timelineEnd,
            totalWidth
        };
    }, [artifacts]);

    const { processedArtifacts, timelineStart, timelineEnd, totalWidth } = timelineData;
    const timelineHeight = processedArtifacts.length * ROW_HEIGHT + HEADER_HEIGHT + 60;
    const totalYearSpan = timelineStart - timelineEnd;

    const yearMarkers = useMemo(() => {
        if (totalYearSpan <= 0) return [];
        
        let step = 25;
        if (totalYearSpan * PIXELS_PER_YEAR < 1500) step = 50;
        if (totalYearSpan * PIXELS_PER_YEAR > 4000) step = 10;
        
        const markers = [];
        const startMarker = Math.floor(timelineStart / step) * step;

        for (let year = startMarker; year >= timelineEnd; year -= step) {
            markers.push(year);
        }
        return markers;
    }, [timelineStart, timelineEnd, totalYearSpan]);

    const getArtifactColor = (artifact) => {
        if (viewMode === 'material') {
            const material = artifact.material || 'unknown';
            const colors = {
                ceramica: { bg: 'from-amber-400 to-orange-500', border: 'border-orange-300', text: 'text-orange-900' },
                metallo: { bg: 'from-slate-400 to-gray-600', border: 'border-gray-400', text: 'text-gray-100' },
                organico: { bg: 'from-green-400 to-emerald-600', border: 'border-green-300', text: 'text-green-900' },
                vari: { bg: 'from-purple-400 to-violet-600', border: 'border-purple-300', text: 'text-purple-100' },
                unknown: { bg: 'from-gray-300 to-gray-500', border: 'border-gray-300', text: 'text-gray-100' }
            };
            return colors[material] || colors.unknown;
        }
        return { bg: 'from-blue-400 to-indigo-500', border: 'border-blue-300', text: 'text-blue-100' };
    };

    const getShapeIcon = (artifact) => {
        const shape = artifact.shape?.[0]?.toLowerCase() || '';
        if (shape.includes('coppa') || shape.includes('ciotola')) return '🏺';
        if (shape.includes('olla') || shape.includes('anfora')) return '🏺';
        if (shape.includes('fibula') || shape.includes('spillone')) return '📎';
        if (shape.includes('anello') || shape.includes('armilla')) return '💍';
        return '⚱️';
    };

    if (processedArtifacts.length === 0) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
                <div className="bg-white p-8 rounded-xl shadow-sm border">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Nessuna cronologia disponibile</h3>
                    <p className="text-gray-500">Non ci sono reperti con datazione valida per creare una linea temporale.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-4 sm:p-6 md:p-8 shadow-lg">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-blue-200 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Cronologia del Corredo</h2>
                        <p className="text-blue-700 font-medium text-sm">
                            {processedArtifacts.length} reperti • {Math.round(timelineStart)}-{Math.round(timelineEnd)} a.C.
                        </p>
                    </div>
                </div>
                
                {/* View Mode Selector */}
                <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-sm w-full sm:w-auto">
                    <button
                        onClick={() => setViewMode('material')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                            viewMode === 'material' 
                                ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                                : 'text-gray-600 hover:bg-white/70'
                        }`}
                    >
                        <Palette className="w-4 h-4" />
                        Materiali
                    </button>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-inner overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <div className="relative bg-gradient-to-b from-gray-50 to-white" style={{ width: `${totalWidth}px`, height: `${timelineHeight}px` }}>
                        
                        {/* Year Grid Background */}
                        {yearMarkers.map((year, index) => {
                            const leftPos = Math.max(0, (timelineStart - year) * PIXELS_PER_YEAR);
                            const isMainMarker = year % 50 === 0;
                            return (
                                <div key={year} className="absolute top-0 bottom-0" style={{ left: `${leftPos}px` }}>
                                    <div className={`h-full ${isMainMarker ? 'w-0.5 bg-blue-300' : 'w-px bg-blue-200/60'}`}></div>
                                </div>
                            );
                        })}

                        {/* Year Labels */}
                        {yearMarkers.map((year) => {
                            const leftPos = Math.max(0, (timelineStart - year) * PIXELS_PER_YEAR);
                            const isMainMarker = year % 100 === 0 || (year % 50 === 0 && totalYearSpan < 150);
                            if (!isMainMarker) return null;
                            return (
                                <div key={`label-${year}`} className="absolute top-4" style={{ left: `${leftPos}px` }}>
                                    <div className="transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                        {year} a.C.
                                    </div>
                                </div>
                            );
                        })}

                        {/* Minor Year Labels */}
                        {yearMarkers.map((year) => {
                            const leftPos = Math.max(0, (timelineStart - year) * PIXELS_PER_YEAR);
                            const isMainMarker = year % 100 === 0 || (year % 50 === 0 && totalYearSpan < 150);
                            const isMinorMarker = !isMainMarker && year % 25 === 0;
                            if (!isMinorMarker) return null;
                            return (
                                <div key={`minor-${year}`} className="absolute top-6" style={{ left: `${leftPos}px` }}>
                                    <div className="transform -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-0.5 rounded text-xs font-semibold shadow border">
                                        {year}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Artifact Timeline Bars */}
                        {processedArtifacts.map((artifact, index) => {
                            const startPos = Math.max(0, (timelineStart - artifact.yearRange.startYear) * PIXELS_PER_YEAR);
                            const endPos = Math.max(startPos + 30, (timelineStart - artifact.yearRange.endYear) * PIXELS_PER_YEAR);
                            const width = endPos - startPos;
                            const top = HEADER_HEIGHT + artifact.rowIndex * ROW_HEIGHT + 12;
                            const colors = getArtifactColor(artifact);
                            const icon = getShapeIcon(artifact);

                            return (
                                <Link 
                                    key={artifact.id} 
                                    to={createPageUrl(`ArtifactDetail?id=${artifact.id}`)}
                                    className="absolute group" 
                                    style={{
                                        left: `${startPos}px`,
                                        top: `${top}px`,
                                        width: `${width}px`,
                                        height: '32px',
                                    }}
                                >
                                    {/* Main Timeline Bar */}
                                    <div className={`w-full h-full bg-gradient-to-r ${colors.bg} rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 ${colors.border} border-2 flex items-center px-3 gap-2`}>
                                        <span className="text-lg">{icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <span className={`font-bold text-sm truncate ${colors.text}`}>
                                                {artifact.inventory_number || 'N.I.'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Enhanced Tooltip */}
                                    <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-20 shadow-2xl border border-gray-700">
                                        <div className="text-center space-y-1">
                                            <div className="text-lg">{icon}</div>
                                            <div className="font-bold text-blue-300">{artifact.inventory_number || 'Senza numero'}</div>
                                            <div className="text-gray-200 text-sm">{artifact.shape?.[0] || 'Reperto'}</div>
                                            <div className="text-yellow-300 text-sm font-medium">{artifact.material || 'N.D.'}</div>
                                            <div className="text-green-300 text-xs bg-green-900/30 px-2 py-1 rounded">
                                                {artifact.dating || 'N.D.'}
                                            </div>
                                        </div>
                                        {/* Tooltip Arrow */}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
                                    </div>

                                    {/* Row Label */}
                                    {artifact.rowIndex % 5 === 0 && (
                                        <div className="absolute -left-16 top-0 h-full flex items-center">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                                                #{artifact.rowIndex + 1}
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Enhanced Legend */}
            <div className="mt-6 pt-6 border-t border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Legenda Materiali</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['ceramica', 'metallo', 'organico', 'vari'].map(material => {
                        const colors = getArtifactColor({ material });
                        const count = processedArtifacts.filter(a => a.material === material).length;
                        return (
                            <div key={material} className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/60">
                                <div className={`w-6 h-6 bg-gradient-to-r ${colors.bg} rounded-lg shadow-sm ${colors.border} border-2`}></div>
                                <div>
                                    <span className="font-semibold text-gray-800 capitalize block">{material}</span>
                                    <span className="text-xs text-gray-600">{count} reperti</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
