import React, { useState, useEffect } from 'react';
import { Artifact } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Package, Calendar, Tag, Eye, ChevronRight, Search, Filter } from 'lucide-react';
import KantharosIcon from '../icons/KantharosIcon';
import { motion } from 'framer-motion';

export default function InteractiveInventory({ tombId, tombName }) {
  const [artifacts, setArtifacts] = useState([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [materialFilter, setMaterialFilter] = useState("all");

  useEffect(() => {
    if (tombId) {
      loadArtifacts();
    }
  }, [tombId]);

  useEffect(() => {
    let filtered = artifacts.filter(artifact => {
      const matchesSearch = !searchTerm || 
        artifact.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artifact.shape || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artifact.class_type || []).join(' ').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMaterial = materialFilter === "all" || artifact.material === materialFilter;
      
      return matchesSearch && matchesMaterial;
    });
    setFilteredArtifacts(filtered);
  }, [artifacts, searchTerm, materialFilter]);

  const loadArtifacts = async () => {
    setLoading(true);
    try {
      const allArtifacts = await Artifact.list('-created_date');
      const tombArtifacts = allArtifacts.filter(artifact => artifact.tomb_id === tombId);
      setArtifacts(tombArtifacts);
      setFilteredArtifacts(tombArtifacts);
    } catch (error) {
      console.error("Errore nel caricamento del corredo:", error);
      setArtifacts([]);
      setFilteredArtifacts([]);
    }
    setLoading(false);
  };

  const materials = [...new Set(artifacts.map(a => a.material).filter(Boolean))];

  const ArtifactCard = ({ artifact }) => {
    const mainShape = (artifact.shape && artifact.shape[0]) || "Reperto";
    const mainClass = (artifact.class_type && artifact.class_type[0]) || "N.D.";
    const hasImage = artifact.artifact_images && artifact.artifact_images.length > 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group"
      >
        <Link 
          to={createPageUrl(`ArtifactDetail?id=${artifact.id}`)}
          className="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          {/* Header con numero inventario prominente */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <KantharosIcon className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="text-xl font-bold text-amber-900">
                    {artifact.inventory_number}
                  </div>
                  <div className="text-sm text-amber-700 font-medium">
                    Numero di Inventario
                  </div>
                </div>
              </div>
              <div className="text-amber-600 group-hover:text-amber-800 transition-colors">
                <Eye className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Immagine del reperto */}
          <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center p-4">
            {hasImage ? (
              <img 
                src={artifact.artifact_images[0]} 
                alt={`${mainShape} - ${artifact.inventory_number}`}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Scheda tecnica essenziale */}
          <div className="p-4 space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 capitalize leading-tight">
                {mainShape}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {mainClass}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-gray-600 truncate capitalize">{artifact.material}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-gray-600 truncate text-xs">
                  {artifact.dating || 'N.D.'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                {artifact.conservation_status?.[0] || 'N.D.'}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento corredo funerario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e controlli */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca nel corredo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="bg-white px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tutti i materiali</option>
              {materials.map(material => (
                <option key={material} value={material} className="capitalize">
                  {material}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Griglia delle schede */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredArtifacts.length > 0 ? (
          filteredArtifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center p-12 bg-white/60 rounded-3xl">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {artifacts.length === 0 ? 'Nessun reperto catalogato' : 'Nessun reperto trovato'}
            </h3>
            <p className="text-gray-500">
              {artifacts.length === 0 
                ? `La tomba ${tombName} non ha ancora reperti associati nel database.`
                : 'Prova a modificare i filtri di ricerca.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Statistiche rapide */}
      {artifacts.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-600">{artifacts.length}</div>
              <div className="text-sm text-gray-600">Reperti Totali</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{materials.length}</div>
              <div className="text-sm text-gray-600">Materiali</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {[...new Set(artifacts.flatMap(a => a.shape || []))].length}
              </div>
              <div className="text-sm text-gray-600">Forme</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {[...new Set(artifacts.map(a => a.dating).filter(Boolean))].length}
              </div>
              <div className="text-sm text-gray-600">Datazioni</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}