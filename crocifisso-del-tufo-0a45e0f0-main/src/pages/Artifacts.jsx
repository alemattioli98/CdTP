
import React, { useState, useEffect, useMemo } from "react";
import { Artifact } from "@/api/entities";
import { Tomb } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, Plus, Package, ChevronRight, Layers, Eye, Tag, Grid, List, Filter
} from "lucide-react";
import KantharosIcon from '../components/icons/KantharosIcon';

export default function Artifacts() {
  const [artifacts, setArtifacts] = useState([]);
  const [tombs, setTombs] = useState([]);
  // const [filteredArtifacts, setFilteredArtifacts] = useState([]); // Removed, now derived via useMemo
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ 
    material: "all", 
    class_type: "all", 
    tomb_id: "all", 
    box_code: "all", 
    shape: "all", 
    excavation_campaign: "all",
    dating: "all" // Added new filter for dating
  });
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    loadData();
  }, []);

  // Filter artifacts based on search term and filters
  const filteredArtifacts = useMemo(() => {
    return artifacts.filter(artifact => {
      const matchesSearch = searchTerm.trim() === "" ||
                           artifact.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artifact.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (artifact.shape || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (artifact.class_type || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMaterial = filters.material === 'all' || artifact.material === filters.material;
      const matchesClass = filters.class_type === 'all' || (artifact.class_type || []).includes(filters.class_type);
      const matchesTomb = filters.tomb_id === 'all' || artifact.tomb_id === filters.tomb_id;
      const matchesBox = filters.box_code === 'all' || artifact.box_code === filters.box_code;
      const matchesShape = filters.shape === 'all' || (artifact.shape || []).includes(filters.shape);
      const matchesCampaign = filters.excavation_campaign === 'all' || artifact.excavation_campaign === filters.excavation_campaign;
      const matchesDating = filters.dating === 'all' || artifact.dating === filters.dating; // New condition for dating

      return matchesSearch && matchesMaterial && matchesClass && matchesTomb && matchesBox && matchesShape && matchesCampaign && matchesDating;
    });
  }, [artifacts, searchTerm, filters]); // Depend on artifacts, searchTerm, and filters

  // Derive unique filter options from artifacts
  const filterOptions = useMemo(() => {
    const uniqueClasses = [...new Set(artifacts.flatMap(a => a.class_type || []))].sort();
    const uniqueShapes = [...new Set(artifacts.flatMap(a => a.shape || []))].sort();
    const uniqueBoxCodes = [...new Set(artifacts.map(a => a.box_code).filter(Boolean))].sort();
    const uniqueCampaigns = [...new Set(artifacts.map(a => a.excavation_campaign).filter(Boolean))].sort();
    const uniqueDatings = [...new Set(artifacts.map(a => a.dating).filter(Boolean))].sort(); // New for dating
    
    return {
      classes: uniqueClasses,
      shapes: uniqueShapes,
      boxCodes: uniqueBoxCodes,
      campaigns: uniqueCampaigns,
      datings: uniqueDatings // New for dating
    };
  }, [artifacts]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [artifactData, tombData] = await Promise.all([
        Artifact.list('-created_date'),
        Tomb.list('Numero_tomba')
      ]);
      setArtifacts(artifactData);
      setTombs(tombData);
      
      // Debug: verifica le relazioni
      console.log('All artifacts:', artifactData);
      console.log('Artifacts with tomb_id:', artifactData.filter(a => a.tomb_id));
    } catch (error) {
      console.error("Errore durante il caricamento dei reperti:", error);
    }
    setLoading(false);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const getTombName = (tombId) => {
    if (!tombId) return 'N.D.';
    const tomb = tombs.find(t => t.id === tombId);
    return tomb ? `${tomb.Numero_tomba}${tomb.Nome ? ` - ${tomb.Nome}` : ''}` : 'N.D.';
  };

  const ArtifactCard = ({ artifact, isListView = false }) => {
    const mainShape = (artifact.shape && artifact.shape[0]) || "Reperto";
    const mainClass = (artifact.class_type && artifact.class_type[0]) || "N.D.";
    const tombName = getTombName(artifact.tomb_id);
    const hasImage = artifact.artifact_images && artifact.artifact_images.length > 0;

    if (isListView) {
      return (
        <Link
          to={createPageUrl(`ArtifactDetail?id=${artifact.id}`)}
          className="group flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] touch-manipulation"
        >
          {/* Professional Image Preview */}
          <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100">
            {hasImage ? (
              <img 
                src={artifact.artifact_images[0]} 
                alt={`${mainShape} - ${artifact.inventory_number}`}
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Package className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
              <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">{mainShape}</h3>
              <span className="px-2 py-1 md:px-3 md:py-1 bg-amber-100 text-amber-700 text-xs md:text-sm font-bold rounded-full flex-shrink-0">
                {artifact.inventory_number}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize font-semibold">
                {mainClass}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full capitalize font-semibold">
                {artifact.material}
              </span>
              {artifact.tomb_id && (
                <div className="flex items-center gap-1">
                  <Layers className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                  <span className="font-medium truncate">{tombName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-amber-600 flex-shrink-0">
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      );
    }

    return (
      <Link
        to={createPageUrl(`ArtifactDetail?id=${artifact.id}`)}
        className="group block bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden touch-manipulation"
      >
        {/* Professional Image Display */}
        <div className="aspect-[4/3] bg-white relative flex items-center justify-center p-3 md:p-4">
          {hasImage ? (
            <img 
              src={artifact.artifact_images[0]} 
              alt={`${mainShape} - ${artifact.inventory_number}`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-amber-400" />
            </div>
          )}
          <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/95 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold text-amber-700 shadow-sm">
            {artifact.inventory_number}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 group-hover:text-amber-600 transition-colors capitalize leading-tight">
            {mainShape}
          </h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 md:w-4 md:h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs md:text-sm text-gray-600 font-semibold capitalize truncate">{mainClass}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-3 h-3 md:w-4 md:h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs md:text-sm text-gray-600 capitalize font-semibold">{artifact.material}</span>
            </div>
            {artifact.tomb_id && (
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-600 font-medium truncate">{tombName}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <KantharosIcon className="w-6 h-6 md:w-8 md:h-8 text-amber-600" />
            Catalogo Reperti
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            {filteredArtifacts.length} {filteredArtifacts.length === 1 ? 'reperto trovato' : 'reperti trovati'}
          </p>
        </div>
        <Link
          to={createPageUrl("AddArtifact")}
          className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold text-sm md:text-base">Nuovo Reperto</span>
        </Link>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-1 xl:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per inventario, forma, classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-base touch-manipulation"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-lg transition-all touch-manipulation ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-lg transition-all touch-manipulation ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Optimized Filters */}
        {/* Adjusted grid columns to accommodate the new filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select 
              value={filters.material} 
              onChange={(e) => handleFilterChange('material', e.target.value)} 
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation"
            >
              <option value="all">Tutti i materiali</option>
              <option value="ceramica">Ceramica</option>
              <option value="metallo">Metallo</option>
              <option value="organico">Organico</option>
              <option value="vari">Vari</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select 
              value={filters.class_type} 
              onChange={(e) => handleFilterChange('class_type', e.target.value)} 
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation"
            >
              <option value="all">Tutte le classi</option>
              {filterOptions.classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select 
              value={filters.shape} 
              onChange={(e) => handleFilterChange('shape', e.target.value)} 
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation"
            >
              <option value="all">Tutte le forme</option>
              {filterOptions.shapes.map(shape => <option key={shape} value={shape}>{shape}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select 
              value={filters.tomb_id} 
              onChange={(e) => handleFilterChange('tomb_id', e.target.value)} 
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation"
            >
              <option value="all">Tutte le tombe</option>
              {tombs.map(tomb => <option key={tomb.id} value={tomb.id}>{tomb.Numero_tomba}{tomb.Nome ? ` - ${tomb.Nome}` : ''}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select 
              value={filters.box_code} 
              onChange={(e) => handleFilterChange('box_code', e.target.value)} 
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation"
            >
              <option value="all">Tutte le cassette</option>
              {filterOptions.boxCodes.map(box => <option key={box} value={box}>{box}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select 
              value={filters.excavation_campaign} 
              onChange={(e) => handleFilterChange('excavation_campaign', e.target.value)} 
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation"
            >
              <option value="all">Tutte le campagne</option>
              {filterOptions.campaigns.map(campaign => <option key={campaign} value={campaign}>{campaign}</option>)}
            </select>
          </div>

          {/* New filter for Dating */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select 
              value={filters.dating} 
              onChange={(e) => handleFilterChange('dating', e.target.value)} 
              className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation"
            >
              <option value="all">Tutte le datazioni</option>
              {filterOptions.datings.map(dating => <option key={dating} value={dating}>{dating}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="text-center p-8 md:p-12">Caricamento in corso...</div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" : "space-y-3 md:space-y-4"}>
          {filteredArtifacts.length > 0 ? (
            filteredArtifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} isListView={viewMode === 'list'} />
            ))
          ) : (
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 text-center p-8 md:p-12 bg-white/60 rounded-3xl">
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Nessun reperto trovato</h3>
                <p className="text-gray-500 mt-2 text-sm md:text-base">Prova a modificare i filtri di ricerca.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
