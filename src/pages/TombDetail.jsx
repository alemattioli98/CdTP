
import React, { useState, useEffect, useMemo } from "react";
import { Tomb } from "@/api/entities";
import { Artifact } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, Calendar, MapPin, Layers, Edit, Eye, List, BarChart3,
  FileText, Package, Scroll, BookOpen,
  Image, Quote, Book, Hash, BookText, Trash2, Clock
} from "lucide-react";
import PhotoGallery from "../components/gallery/PhotoGallery";
import InteractiveInventory from "../components/tomb/InteractiveInventory";
import TombInventoryChart from "../components/tomb/TombInventoryChart";
import InteractiveMap from '../components/map/InteractiveMap';
import TombIcon from "../components/icons/TombIcon";
import TombTimeline from "../components/tomb/TombTimeline";

export default function TombDetail() {
  const navigate = useNavigate();
  const [tomb, setTomb] = useState(null);
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const [activeTab, setActiveTab] = useState("dettagli"); // Kept 'dettagli' for consistency with existing rendering
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const necropolisMapUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d5551934_PiantaNecropolidiCrocifissodelTufo.png";

  const tombId = useMemo(() => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('id');
  }, []);

  useEffect(() => {
    if (!tombId) {
      navigate(createPageUrl("Tombs"));
      return;
    }

    const loadTombData = async () => { // Renamed from fetchTombData
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const tombData = await Tomb.get(tombId);
        setTomb(tombData);

        // Carica reperti associati usando il filtro corretto 'tomb_id'
        const associatedArtifacts = await Artifact.filter({ tomb_id: tombId }, '-created_date'); // Filter by tomb_id and sort
        console.log('Artifacts found for tomb:', associatedArtifacts); // Debug log
        setArtifacts(associatedArtifacts);

      } catch (err) {
        console.error("Errore nel caricamento dei dati della tomba:", err);
        setError("Impossibile caricare i dati della tomba."); // Set user-friendly error message
        setTomb(null); // Clear tomb data on error
        setArtifacts([]); // Clear artifacts on error
      } finally {
        setLoading(false);
      }
    };
    loadTombData();
  }, [tombId, navigate]);

  const handleDeleteTomb = async () => {
    if (!tomb) return;
    const confirmDeletion = window.confirm(`Sei sicuro di voler eliminare la tomba "${tomb.Nome || `N. ${tomb.Numero_tomba}`}?"`);
    if (confirmDeletion) {
      try {
        await Tomb.delete(tomb.id);
        alert("Tomba eliminata con successo!");
        navigate(createPageUrl("Tombs"));
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        alert(`Errore: ${error.message || "Si è verificato un errore."}`);
      }
    }
  };
  
  const openGallery = (index = 0) => {
    setGalleryStartIndex(index);
    setGalleryOpen(true);
  };

  const getCentroid = (points = []) => {
    if (!points || points.length === 0) return null;
    if (points.length === 1) return points[0];
    let x = 0, y = 0, len = points.length;
    for (let i = 0; i < len; i++) {
        x += points[i].x;
        y += points[i].y;
    }
    return { x: x / len, y: y / len };
  };
  
  const initialMapPosition = useMemo(() => getCentroid(tomb?.shape_coordinates), [tomb]);
  
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  // Display error message if loading failed
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
      <div>
        <TombIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-700">{error}</h3>
        <p className="text-gray-600 mt-2">Per favore, riprova più tardi o contatta l'assistenza.</p>
        <Link to={createPageUrl("Tombs")} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <ArrowLeft className="w-4 h-4" /> Torna al Catalogo
        </Link>
      </div>
    </div>
  );

  // Display "Tomb not found" if no tomb data despite no explicit error
  if (!tomb) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
      <div>
        <TombIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">Tomba non trovata</h3>
        <Link to={createPageUrl("Tombs")} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <ArrowLeft className="w-4 h-4" /> Torna al Catalogo
        </Link>
      </div>
    </div>
  );

  const allTombImages = [tomb.tomb_photo, tomb.plan_photo, tomb.excavation_photo, ...(tomb.additional_images || [])].filter(Boolean).flat();
  const allTombImageTitles = [ "Foto Tomba", "Foto Pianta", "Foto Scavo", ...(tomb.additional_images?.map((_,i) => `Immagine Aggiuntiva ${i+1}`) || [])].filter((_, i) => allTombImages[i]);
  
  const renderContent = () => {
    switch(activeTab) {
      case 'dettagli': return <DetailsTab tomb={tomb} images={allTombImages} titles={allTombImageTitles} onOpenGallery={openGallery} mapUrl={necropolisMapUrl} mapPosition={initialMapPosition} />;
      case 'corredo': return <CorredoTab artifacts={artifacts} tomb={tomb} />;
      case 'epigrafia': return <EpigrafiaTab tomb={tomb} />;
      case 'documentazione': return <DocumentationTab tomb={tomb} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Link to={createPageUrl("Tombs")} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors group">
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Torna al Catalogo Tombe</span>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl"><TombIcon className="w-8 h-8 text-emerald-600" /></div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{tomb.Nome || `Tomba N. ${tomb.Numero_tomba}`}</h1>
                  <p className="text-gray-500 text-sm">ID: {tomb.Numero_tomba}</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link to={createPageUrl(`EditTomb?id=${tomb.id}`)} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold shadow-sm hover:bg-emerald-700 transition-all">
                <Edit className="w-4 h-4" />Modifica
              </Link>
              <button onClick={handleDeleteTomb} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow-sm hover:bg-red-700 transition-all">
                <Trash2 className="w-4 h-4" />Elimina
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="-mb-px flex space-x-2 overflow-x-auto py-2">
                  {[{ id: 'dettagli', label: 'Dettagli', icon: FileText }, { id: 'corredo', label: `Corredo (${artifacts.length})`, icon: Package }, ...(tomb.has_epigraphy ? [{ id: 'epigrafia', label: 'Epigrafia', icon: Scroll }] : []), { id: 'documentazione', label: 'Documentazione', icon: BookOpen }].map((tab) => (<TabButton key={tab.id} id={tab.id} label={tab.label} icon={tab.icon} activeTab={activeTab} onClick={setActiveTab} />))}
              </nav>
          </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="animate-fade-in">{renderContent()}</div></div>
      
      {isGalleryOpen && <PhotoGallery images={allTombImages} titles={allTombImageTitles} currentIndex={galleryStartIndex} onClose={() => setGalleryOpen(false)} />}
    </div>
  );
}

const TabButton = ({ id, label, icon: Icon, activeTab, onClick }) => (
  <button 
    onClick={() => onClick(id)} 
    className={`flex items-center gap-3 px-6 py-4 mx-1 rounded-t-2xl border-2 border-b-0 font-semibold text-sm transition-all duration-200 whitespace-nowrap min-w-fit ${
      activeTab === id 
        ? 'bg-white border-emerald-200 text-emerald-700 shadow-lg -mb-2 z-10 relative' 
        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

const DetailsTab = ({ tomb, images, titles, onOpenGallery, mapUrl, mapPosition }) => (
  <div className="grid lg:grid-cols-3 gap-8 items-start">
    <div className="lg:col-span-2 space-y-8">
      <InfoCard title="Descrizione Generale" icon={FileText}><div className="prose prose-gray max-w-none"><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{tomb.descrizione || "Nessuna descrizione disponibile."}</p></div></InfoCard>
      {tomb.appunti_di_scavo && <InfoCard title="Appunti di Scavo" icon={FileText}><div className="prose prose-gray max-w-none"><p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{tomb.appunti_di_scavo}</p></div></InfoCard>}
      {images.length > 0 && <InfoCard title="Galleria Fotografica" icon={Image}><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{images.slice(0, 5).map((img, i) => (<div key={i} className="relative group cursor-pointer overflow-hidden rounded-xl" onClick={() => onOpenGallery(i)}><img src={img} alt={titles[i]} className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center"><Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" /></div></div>))}{images.length > 5 && (<div onClick={() => onOpenGallery(5)} className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200"><Eye className="w-8 h-8 mb-2 text-gray-600"/><span className="text-sm font-semibold text-gray-600">+{images.length - 5} altre</span></div>)}</div></InfoCard>}
    </div>
    <div className="space-y-6 lg:sticky lg:top-24">
      <InfoCard title="Scheda Tecnica">
        <dl className="space-y-4">
          <DetailItem icon={Calendar} label="Datazione" value={tomb.datazione} />
          <DetailItem icon={Layers} label="Tipologia" value={tomb.tipologia_tomba} />
          <DetailItem icon={MapPin} label="Localizzazione" value={tomb.localizzazione} />
        </dl>
      </InfoCard>
      {mapPosition && (
        <InfoCard title="Posizione su Mappa" icon={MapPin}>
          <div className="relative overflow-hidden rounded-lg h-64 border">
            <InteractiveMap mapUrl={mapUrl} tombs={[tomb]} isStatic={true} initialZoom={3} initialPosition={mapPosition} />
          </div>
        </InfoCard>
      )}
    </div>
  </div>
);

const EpigrafiaTab = ({ tomb }) => (<div className="max-w-4xl mx-auto space-y-8">{tomb.epigraphy_photo && <InfoCard title="Rilievo" icon={Image}><img src={tomb.epigraphy_photo} alt="Rilievo epigrafico" className="max-w-full h-auto rounded-lg shadow-md mx-auto" /></InfoCard>}<div className="grid lg:grid-cols-2 gap-8"><InfoCard title="Traslitterazione" icon={Quote}><p className="font-mono text-lg">{tomb.epigraphy_transliteration || "N.D."}</p></InfoCard><InfoCard title="Riferimento CIE" icon={Hash}><p className="font-semibold">{tomb.epigraphy_cie_reference || "N.D."}</p></InfoCard></div><InfoCard title="Descrizione" icon={FileText}><p className="whitespace-pre-wrap">{tomb.epigraphy_description || "N.D."}</p></InfoCard><InfoCard title="Bibliografia" icon={BookText}><p className="whitespace-pre-wrap">{tomb.epigraphy_bibliography || "N.D."}</p></InfoCard></div>);
const CorredoTab = ({ artifacts, tomb }) => {
    const [activeView, setActiveView] = useState('inventario'); 
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Corredo Funerario ({artifacts.length})</h2>
                <div className="bg-gray-100 p-1 rounded-xl inline-flex gap-1">
                    <SubTabButton id="inventario" label="Inventario" icon={List} activeTab={activeView} onClick={setActiveView} />
                    <SubTabButton id="statistiche" label="Statistiche" icon={BarChart3} activeTab={activeView} onClick={setActiveView} />
                    <SubTabButton id="timeline" label="Cronologia" icon={Clock} activeTab={activeView} onClick={setActiveView} />
                </div>
            </div>
            {activeView === 'inventario' && <InteractiveInventory tombId={tomb.id} tombName={tomb.Nome || `Tomba ${tomb.Numero_tomba}`} />}
            {activeView === 'statistiche' && <TombInventoryChart artifacts={artifacts} />}
            {activeView === 'timeline' && <TombTimeline artifacts={artifacts} />}
        </div>
    );
};
const DocumentationTab = ({ tomb }) => (<div className="max-w-4xl mx-auto"><InfoCard title="Bibliografia e Riferimenti" icon={BookOpen}><p className="whitespace-pre-wrap">{tomb.bibliography_notes || "Nessun riferimento bibliografico."}</p></InfoCard></div>);
const InfoCard = ({ title, icon: Icon, children }) => (<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div className="p-5 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-3">{Icon && <Icon className="w-5 h-5 text-emerald-600" />}{title}</h3></div><div className="p-5">{children}</div></div>);
const DetailItem = ({ icon: Icon, label, value }) => value && (<div className="flex items-start gap-4"><div className="flex-shrink-0 mt-1 p-2 bg-gray-100 rounded-full"><Icon className="w-4 h-4 text-emerald-600" /></div><div><dt className="text-sm font-medium text-gray-600">{label}</dt><dd className="mt-0.5 text-sm text-gray-900 font-semibold">{value}</dd></div></div>);

const SubTabButton = ({ id, label, icon: Icon, activeTab, onClick }) => (
    <button 
        onClick={() => onClick(id)} 
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
            activeTab === id 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 shadow-sm'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);
