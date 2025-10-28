
import React, { useState, useEffect } from "react";
import { Tomb } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Plus, Layers, MapPin, Calendar, ChevronRight, Filter,
  Eye, Grid, List, SortAsc, SortDesc, Map
} from "lucide-react";
import TombIcon from '../components/icons/TombIcon';
import InteractiveMap from '../components/map/InteractiveMap';

export default function Tombs() {
  const [tombs, setTombs] = useState([]);
  const [filteredTombs, setFilteredTombs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [viewMode, setViewMode] = useState("map");
  const [sortBy, setSortBy] = useState("Numero_tomba");
  const [sortOrder, setSortOrder] = useState("asc");

  const necropolisMapUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d5551934_PiantaNecropolidiCrocifissodelTufo.png";

  useEffect(() => {
    loadTombs();
  }, []);

  useEffect(() => {
    let filtered = tombs.filter(tomb => {
      const matchesSearch = tomb.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tomb.Numero_tomba?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tomb.localizzazione?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPeriod = selectedPeriod === "all" || tomb.datazione === selectedPeriod;
      return matchesSearch && matchesPeriod;
    });

    if (viewMode !== 'map') {
      filtered.sort((a, b) => {
        let aVal = a[sortBy] || "";
        let bVal = b[sortBy] || "";
        if (sortBy === 'Numero_tomba') {
            const numA = parseInt(String(aVal).match(/\d+/g)?.join(''), 10) || 0;
            const numB = parseInt(String(bVal).match(/\d+/g)?.join(''), 10) || 0;
            if (numA !== numB) return sortOrder === 'asc' ? numA - numB : numB - numA;
        }
        const comparison = String(aVal).localeCompare(String(bVal), 'it', { sensitivity: 'base' });
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    setFilteredTombs(filtered);
  }, [tombs, searchTerm, selectedPeriod, sortBy, sortOrder, viewMode]);

  const loadTombs = async () => {
    setLoading(true);
    try {
      const data = await Tomb.list('-created_date');
      setTombs(data);
    } catch (error) {
      console.error("Errore nel caricamento delle tombe:", error);
    }
    setLoading(false);
  };

  const periods = [...new Set(tombs.map(t => t.datazione).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3 drop-shadow-sm">
            <TombIcon className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
            Catalogo Tombe
          </h1>
          <p className="text-gray-700 mt-1 font-medium text-sm md:text-base">
            {filteredTombs.length} {filteredTombs.length === 1 ? 'tomba trovata' : 'tombe trovate'}
          </p>
        </div>
        <Link to={createPageUrl("AddTomb")} className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 touch-manipulation">
          <Plus className="w-5 h-5" />
          <span className="font-semibold text-sm md:text-base">Nuova Tomba</span>
        </Link>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca per nome, numero o localizzazione..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-12 pr-4 py-3 md:py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300 text-base touch-manipulation" 
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-5 h-5 text-gray-500" />
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)} 
                className="px-3 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300 text-sm touch-manipulation min-w-0"
              >
                <option value="all">Tutte le datazioni</option>
                {periods.map(period => (<option key={period} value={period}>{period}</option>))}
              </select>
            </div>
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl flex-shrink-0">
              <button 
                onClick={() => setViewMode('map')} 
                className={`p-2 md:p-2 rounded-lg transition-all touch-manipulation ${viewMode === 'map' ? 'bg-white shadow-sm' : ''}`} 
                title="Vista Mappa"
              >
                <Map className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 md:p-2 rounded-lg transition-all touch-manipulation ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`} 
                title="Vista Griglia"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 md:p-2 rounded-lg transition-all touch-manipulation ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`} 
                title="Vista Lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode !== 'map' && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-gray-600">Ordina per:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="px-3 py-2 bg-white/60 rounded-lg border border-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 touch-manipulation"
            >
              <option value="Nome">Nome</option>
              <option value="Numero_tomba">Numero</option>
              <option value="datazione">Datazione</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
              className="p-2 bg-white/60 rounded-lg border border-white/50 hover:bg-white/80 transition-all touch-manipulation"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-96 bg-white/50 rounded-3xl animate-pulse flex items-center justify-center">
          <p>Caricamento...</p>
        </div>
      ) : viewMode === 'map' ? (
        <InteractiveMap mapUrl={necropolisMapUrl} tombs={filteredTombs} />
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-3 md:space-y-4"}>
          {filteredTombs.length > 0 ? (
            filteredTombs.map((tomb, index) => <TombCard key={tomb.id} tomb={tomb} isListView={viewMode === 'list'} />)
          ) : (
            <div className="md:col-span-2 lg:col-span-3 text-center p-8 md:p-12 bg-white/70 rounded-3xl">
              <h3 className="text-lg md:text-xl font-bold">Nessuna tomba trovata</h3>
              <p className="text-sm md:text-base">Prova a modificare i filtri.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TombCard = ({ tomb, isListView = false }) => {
    const tombName = tomb.Nome || `Tomba ${tomb.Numero_tomba}`;
    
    if (isListView) {
      return (
        <Link to={createPageUrl(`TombDetail?id=${tomb.id}`)} className="group flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] touch-manipulation">
          <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <TombIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">{tombName}</h3>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mt-1">
              {tomb.datazione && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                  <span>{tomb.datazione}</span>
                </div>
              )}
              {tomb.shape_coordinates && tomb.shape_coordinates.length > 0 && (
                <div className="flex items-center gap-1">
                  <Map className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                  <span className="text-xs">Su mappa</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 flex-shrink-0">
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      );
    }

    return (
      <Link to={createPageUrl(`TombDetail?id=${tomb.id}`)} className="group block transform transition-all duration-500 hover:scale-105 touch-manipulation">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="h-24 md:h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 relative flex items-end p-3 md:p-4">
              <h3 className="text-white text-lg md:text-2xl font-bold drop-shadow-lg">{tomb.Numero_tomba}</h3>
          </div>
          <div className="p-4 md:p-6">
            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3 group-hover:text-emerald-600 transition-colors leading-tight">
              {tombName}
            </h4>
            <div className="flex items-center gap-2 text-gray-600 text-xs md:text-sm font-medium mb-3 md:mb-4">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 text-emerald-500 flex-shrink-0" />
              <span>{tomb.datazione || 'N.D.'}</span>
            </div>
            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-100">
              <span className="px-2 py-1 md:px-3 md:py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                {tomb.tipologia_tomba || 'N.D.'}
              </span>
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
};
