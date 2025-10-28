import React, { useState, useEffect } from "react";
import { Artifact } from "@/api/entities";
import { Tomb } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, Edit3, Package, Calendar, MapPin, 
  Layers, Tag, Image, FileText, Eye, ChevronLeft, ChevronRight, X
} from "lucide-react";
import KantharosIcon from '../components/icons/KantharosIcon';

const InfoCard = ({ title, children, icon: Icon }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
      {Icon && <Icon className="w-6 h-6 text-amber-600" />}
      {title}
    </h3>
    {children}
  </div>
);

const DataRow = ({ label, value, className = "" }) => (
  <div className={`flex justify-between py-2 border-b border-gray-100 last:border-b-0 ${className}`}>
    <span className="font-medium text-gray-700">{label}</span>
    <span className="text-gray-900 text-right flex-1 ml-4">{value || 'N.D.'}</span>
  </div>
);

export default function ArtifactDetail() {
  const navigate = useNavigate();
  const [artifact, setArtifact] = useState(null);
  const [tomb, setTomb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      loadArtifact(id);
    } else {
      navigate(createPageUrl("Artifacts"));
    }
  }, [navigate]);

  const loadArtifact = async (id) => {
    setLoading(true);
    try {
      const artifactData = await Artifact.list();
      const foundArtifact = artifactData.find(a => a.id === id);
      
      if (foundArtifact) {
        setArtifact(foundArtifact);
        
        if (foundArtifact.tomb_id) {
          const tombData = await Tomb.list();
          const foundTomb = tombData.find(t => t.id === foundArtifact.tomb_id);
          setTomb(foundTomb);
        }
      } else {
        console.error("Artifact not found");
        navigate(createPageUrl("Artifacts"));
      }
    } catch (error) {
      console.error("Error loading artifact:", error);
      navigate(createPageUrl("Artifacts"));
    }
    setLoading(false);
  };

  const openGallery = (index = 0) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  const nextImage = () => {
    if (artifact?.artifact_images) {
      setCurrentImageIndex((prev) => 
        prev === artifact.artifact_images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (artifact?.artifact_images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? artifact.artifact_images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Caricamento reperto...</p>
        </div>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Reperto non trovato</h2>
        <p className="text-gray-600 mt-2">Il reperto richiesto non esiste nel database.</p>
      </div>
    );
  }

  const mainShape = (artifact.shape && artifact.shape[0]) || "Reperto";
  const mainClass = (artifact.class_type && artifact.class_type[0]) || "N.D.";
  const artifactImages = artifact.artifact_images || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(createPageUrl("Artifacts"))}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg">
              <KantharosIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                {mainShape}
              </h1>
              <div className="flex items-center gap-2 text-amber-700 font-bold text-lg">
                <Tag className="w-5 h-5" />
                {artifact.inventory_number}
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(createPageUrl(`EditArtifact?id=${artifact.id}`))}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl shadow-lg hover:bg-amber-700 transition-colors"
        >
          <Edit3 className="w-5 h-5" />
          Modifica
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Colonna sinistra - Immagini */}
        <div className="space-y-6">
          {artifactImages.length > 0 && (
            <InfoCard title="Documentazione Fotografica" icon={Image}>
              <div className="space-y-6">
                {/* Main Image - Larger Display */}
                <div className="aspect-[4/3] lg:aspect-[3/2] relative overflow-hidden rounded-xl bg-white shadow-lg cursor-pointer group" onClick={() => openGallery(0)}>
                  <img 
                    src={artifactImages[0]} 
                    alt={`${mainShape} - ${artifact.inventory_number}`}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-4">
                      <Eye className="w-8 h-8 text-gray-800" />
                    </div>
                  </div>
                </div>

                {/* Additional Images Thumbnails */}
                {artifactImages.length > 1 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Viste aggiuntive ({artifactImages.length - 1})</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {artifactImages.slice(1).map((img, i) => (
                        <div 
                          key={i + 1} 
                          className="relative group cursor-pointer overflow-hidden rounded-lg bg-white p-2 shadow-sm border hover:shadow-lg transition-all" 
                          onClick={() => openGallery(i + 1)}
                        >
                          <img 
                            src={img} 
                            alt={`Vista ${i + 2}`} 
                            className="w-full aspect-[4/3] object-contain transition-transform duration-300 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>
          )}
        </div>

        {/* Colonna destra - Informazioni */}
        <div className="space-y-6">
          {/* 1. Scheda Tecnica */}
          <InfoCard title="Scheda Tecnica" icon={Package}>
            <div className="space-y-1">
              <DataRow label="Materiale" value={artifact.material} className="capitalize" />
              <DataRow label="Stato di Conservazione" value={(artifact.conservation_status || []).join(', ')} />
              <DataRow label="Oggetto" value={(artifact.object_type || []).join(', ')} />
              <DataRow label="Forma" value={(artifact.shape || []).join(', ')} className="capitalize" />
              <DataRow label="Classe" value={(artifact.class_type || []).join(', ')} />
              <DataRow label="Datazione" value={artifact.dating} />
              
              {/* Dimensioni */}
              {artifact.dimensions && Object.values(artifact.dimensions).some(v => v) && (
                <>
                  <div className="pt-2 pb-1 border-b border-gray-200">
                    <span className="font-semibold text-gray-800">Dimensioni (cm)</span>
                  </div>
                  {artifact.dimensions.rim_diameter && (
                    <DataRow label="Diametro Orlo" value={`${artifact.dimensions.rim_diameter} cm`} />
                  )}
                  {artifact.dimensions.base_diameter && (
                    <DataRow label="Diametro Fondo" value={`${artifact.dimensions.base_diameter} cm`} />
                  )}
                  {artifact.dimensions.rim_height && (
                    <DataRow label="Altezza Orlo" value={`${artifact.dimensions.rim_height} cm`} />
                  )}
                  {artifact.dimensions.handle_height && (
                    <DataRow label="Altezza Ansa" value={`${artifact.dimensions.handle_height} cm`} />
                  )}
                </>
              )}
            </div>
          </InfoCard>

          {/* 2. Dati di Scavo */}
          <InfoCard title="Dati di Scavo" icon={MapPin}>
            <div className="space-y-1">
              <DataRow 
                label="Tomba Associata" 
                value={tomb ? `${tomb.Numero_tomba}${tomb.Nome ? ` - ${tomb.Nome}` : ''}` : 'Nessuna associazione'} 
              />
              <DataRow label="Codice Cassetta" value={artifact.box_code} />
              <DataRow label="Campagna di Scavo" value={artifact.excavation_campaign} />
              {artifact.stratigraphic_unit && (
                <DataRow label="Unità Stratigrafica" value={`US ${artifact.stratigraphic_unit}`} />
              )}
              
              {/* Cartellino allegato */}
              {artifact.excavation_data?.content && (
                <>
                  <div className="pt-2 pb-1 border-b border-gray-200">
                    <span className="font-semibold text-gray-800">
                      {artifact.excavation_data.source || 'Dati di scavo'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {artifact.excavation_data.content}
                    </p>
                  </div>
                </>
              )}
            </div>
          </InfoCard>

          {/* 3. Descrizione Analitica */}
          {artifact.description && (
            <InfoCard title="Descrizione Analitica" icon={FileText}>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {artifact.description}
              </p>
            </InfoCard>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryOpen && artifactImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl max-h-full">
            <button 
              onClick={() => setGalleryOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {artifactImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            <img 
              src={artifactImages[currentImageIndex]} 
              alt={`${mainShape} - Vista ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {artifactImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {artifactImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}