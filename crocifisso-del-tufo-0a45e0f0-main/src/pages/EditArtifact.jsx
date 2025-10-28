
import React, { useState, useEffect, useMemo } from "react";
import { Artifact } from "@/api/entities";
import { Tomb } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft } from "lucide-react";
import CheckboxGroup from "../components/forms/CheckboxGroup";
import ImageUploader from "../components/common/ImageUploader";
import KantharosIcon from "../components/icons/KantharosIcon";

const artifactOptions = {
    conservation_status: ["Integro", "Frammentario", "Lacunoso", "Ricomposto", "Restaurato con integrazioni", "Ossidato"],
    object_type: ["Forma intera", "Orlo", "Parete/Vasca", "Ansa", "Fondo"],
    class_type: {
        ceramica: ["Bucchero", "Bucchero grigio", "Bucchero mal cotto", "Impasto comune", "Impasto rosso-bruno", "Impasto esternamente nero e lucido", "Depurata acroma", "Attica", "Attica ffnn", "Attica ffrr", "Vernice nera", "Etrusca figurata", "Impasto rosso", "Impasto white on red", "Etrusco-corinzia"],
        metallo: ["Bronzo", "Argento", "Ferro", "Oro"],
        organico: ["osso", "osteologico", "legno", "carbone", "resti alimentari"],
        vari: ["Pasta vitrea", "Avorio", "Faience"],
    },
    shape: {
        ceramica: ["Alabastron", "Anfora", "Aryballos", "Attingitoio", "Calice", "Ciotola", "Coppa", "Coppetta", "Coperchio", "Cratere", "Fondo ad anello", "Fuseruola", "Hydria", "Lydion", "Kantharos", "Kyathos", "Kylix", "Lekythos", "Oinochoe", "Olpe", "Olla", "Olla biansata", "Olla monoansata", "Olla stamnoide", "Patera", "Pelike", "Piattello", "Psykter", "Pisside", "Rhyton", "Skyphos", "Stamnos", "Thymiaterion", "Supporto"],
        metallo: ["Spirale fermatrecce", "Spiedo", "Borchia", "Chiodo", "Alare", "Staffa", "Fibula", "Lamina", "Punta di lancia", "Armilla", "Nettaunghie", "Anello", "Bulla/Pendaglio", "Lama", "Spillone", "Bacile", "Orecchino", "Tirabrace", "Molle da fuoco"],
        organico: ["Spirale fermatrecce", "Spiedo", "Borchia", "Chiodo", "Alare", "Staffa", "Fibula", "Lamina", "Punta di lancia", "Armilla", "Nettaunghie", "Anello", "Bulla/Pendaglio", "Lama", "Spillone", "Bacile", "Orecchino", "Tirabrace", "Molle da fuoco"],
        vari: ["Spirale fermatrecce", "Spiedo", "Borchia", "Chiodo", "Alare", "Staffa", "Fibula", "Lamina", "Punta di lancia", "Armilla", "Nettaunghie", "Anello", "Bulla/Pendaglio", "Lama", "Spillone", "Bacile", "Orecchino", "Tirabrace", "Molle da fuoco"],
    },
};

const FormField = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
);
  
const FormInput = (props) => (
    <input {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
);

const FormSelect = (props) => (
    <select {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
);
  
const FormTextArea = (props) => (
    <textarea {...props} rows="4" className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500" />
);

export default function EditArtifact() {
  const navigate = useNavigate();
  const [tombs, setTombs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [artifactData, setArtifactData] = useState({
    inventory_number: "",
    box_code: "",
    tomb_id: "",
    excavation_campaign: "Bizzarri-Binaco",
    stratigraphic_unit: "",
    dating: "",
    conservation_status: [],
    object_type: [],
    material: "ceramica",
    class_type: [],
    shape: [],
    dimensions: { rim_diameter: "", base_diameter: "", rim_height: "", handle_height: "" },
    excavation_data: { source: "Cartellino allegato", content: "" },
    description: "",
    artifact_images: [],
  });

  const periodOptions = [
    "seconda metà VII sec. a.C.",
    "primo quarto VI sec. a.C.",
    "secondo quarto VI sec. a.C.",
    "terzo quarto VI sec. a.C.",
    "ultimo quarto VI sec. a.C.",
    "prima metà VI sec. a.C.",
    "seconda metà VI sec. a.C.",
    "primo quarto V sec. a.C.",
    "secondo quarto V sec. a.C.",
    "terzo quarto V sec. a.C.",
    "ultimo quarto V sec. a.C.",
    "prima metà V sec. a.C.",
    "seconda metà V sec. a.C."
  ];

  // Funzione per convertire date numeriche in quarti di secolo
  const convertDateToPeriod = (dateString) => {
    const normalizedInput = dateString.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Se è già un periodo formattato, restituiscilo
    if (periodOptions.some(period => period.toLowerCase() === normalizedInput)) {
      return periodOptions.find(period => period.toLowerCase() === normalizedInput);
    }
    
    // Estrai l'anno dalla stringa (cerca numeri seguiti da "a.c." o "ac")
    const yearMatch = normalizedInput.match(/(\d{3,4})\s*(?:a\.?c\.?|ac)/);
    if (!yearMatch) return dateString; // Se non trova una data, restituisce l'input originale
    
    const year = parseInt(yearMatch[1]);
    
    // Conversione per quarti di secolo (logica archeologica)
    // Ordered to prioritize more specific ranges (quarters) over broader ones (halves)
    if (year >= 675 && year <= 650) return "seconda metà VII sec. a.C.";
    if (year >= 600 && year <= 575) return "primo quarto VI sec. a.C.";
    if (year >= 575 && year <= 550) return "secondo quarto VI sec. a.C.";
    if (year >= 550 && year <= 525) return "terzo quarto VI sec. a.C.";
    if (year >= 525 && year <= 500) return "ultimo quarto VI sec. a.C.";
    if (year >= 500 && year <= 475) return "primo quarto V sec. a.C.";
    if (year >= 475 && year <= 450) return "secondo quarto V sec. a.C.";
    if (year >= 450 && year <= 425) return "terzo quarto V sec. a.C.";
    if (year >= 425 && year <= 400) return "ultimo quarto V sec. a.C.";
    // Broader half-century ranges
    if (year >= 600 && year <= 550) return "prima metà VI sec. a.C.";
    if (year >= 550 && year <= 500) return "seconda metà VI sec. a.C.";
    if (year >= 500 && year <= 450) return "prima metà V sec. a.C.";
    if (year >= 450 && year <= 400) return "seconda metà V sec. a.C.";
    
    return dateString; // Se non rientra nei periodi noti, restituisce l'input originale
  };

  const handleDatingChange = (e) => {
    const inputValue = e.target.value;
    const convertedPeriod = convertDateToPeriod(inputValue);
    setArtifactData(prev => ({ ...prev, dating: convertedPeriod }));
  };

  const isStratigraphic = useMemo(() => artifactData.excavation_campaign === 'Bizzarri-Binaco', [artifactData.excavation_campaign]);

  useEffect(() => {
    const loadArtifactData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const artifactId = urlParams.get('id');
      
      if (!artifactId) {
        navigate(createPageUrl("Artifacts"));
        return;
      }

      setIsLoading(true);
      try {
        const [artifactDataResponse, tombData] = await Promise.all([
          Artifact.get(artifactId),
          Tomb.list('Numero_tomba')
        ]);
        
        // Assicurati che tutti i campi array siano inizializzati
        const normalizedData = {
          ...artifactDataResponse,
          conservation_status: artifactDataResponse.conservation_status || [],
          object_type: artifactDataResponse.object_type || [],
          class_type: artifactDataResponse.class_type || [],
          shape: artifactDataResponse.shape || [],
          artifact_images: artifactDataResponse.artifact_images || [],
          dimensions: artifactDataResponse.dimensions || { rim_diameter: "", base_diameter: "", rim_height: "", handle_height: "" },
          excavation_data: artifactDataResponse.excavation_data || { source: "Cartellino allegato", content: "" }
        };
        
        setArtifactData(normalizedData);
        setTombs(tombData);
        console.log('Loaded artifact data:', normalizedData); // Debug log
      } catch (error) {
        console.error("Failed to load artifact data:", error);
        alert("Errore nel caricamento del reperto.");
        navigate(createPageUrl("Artifacts"));
      }
      setIsLoading(false);
    };

    loadArtifactData();
  }, [navigate]);

  useEffect(() => {
    // Reset conditional fields when material changes
    setArtifactData(prev => ({ ...prev, class_type: [], shape: [] }));
  }, [artifactData.material]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArtifactData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedInputChange = (parent, name, value) => {
    setArtifactData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [name]: value },
    }));
  };

  const handleMultiSelectChange = (field, selected) => {
    setArtifactData(prev => ({ ...prev, [field]: selected }));
  };

  const handleImagesChange = (urls) => {
    setArtifactData(prev => ({ ...prev, artifact_images: urls }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artifactData.inventory_number || !artifactData.material) {
      alert("Numero di Inventario e Materiale sono obbligatori.");
      return;
    }
    
    setIsSaving(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const artifactId = urlParams.get('id');
      
      const dataToSave = { ...artifactData };
      if (!isStratigraphic) {
          dataToSave.stratigraphic_unit = "";
      }
      
      // Debug: verifica i dati prima del salvataggio
      console.log('Updating artifact data:', dataToSave);
      
      await Artifact.update(artifactId, dataToSave);
      alert("Reperto aggiornato con successo!");
      navigate(createPageUrl("Artifacts"));
    } catch (error) {
      console.error("Failed to update artifact:", error);
      alert(`Si è verificato un errore durante l'aggiornamento: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <KantharosIcon className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold text-amber-800">Caricamento reperto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 min-h-screen p-4 sm:p-6 lg:p-8">
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-200 rounded-lg"><KantharosIcon className="w-8 h-8 text-amber-700" /></div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifica Reperto</h1>
            <p className="text-amber-800 mt-1">Aggiorna i dati di catalogazione scientifica.</p>
          </div>
        </div>
        <button type="button" onClick={() => {
          const urlParams = new URLSearchParams(window.location.search);
          const artifactId = urlParams.get('id');
          navigate(createPageUrl(`ArtifactDetail?id=${artifactId}`));
        }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Annulla
        </button>
      </div>

      {/* Section 1: Identificazione */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Identificazione</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Numero di Inventario"><FormInput name="inventory_number" value={artifactData.inventory_number} onChange={handleInputChange} required /></FormField>
          <FormField label="Codice Cassetta"><FormInput name="box_code" value={artifactData.box_code} onChange={handleInputChange} /></FormField>
          <FormField label="Tomba Associata">
            <FormSelect name="tomb_id" value={artifactData.tomb_id} onChange={handleInputChange}>
              <option value="">Nessuna associazione</option>
              {tombs.map(tomb => (
                <option key={tomb.id} value={tomb.id}>
                  {tomb.Numero_tomba}{tomb.Nome ? ` - ${tomb.Nome}` : ''}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField label="Campagna di Scavo">
            <FormSelect name="excavation_campaign" value={artifactData.excavation_campaign} onChange={handleInputChange}>
              <option value="Bizzarri">Bizzarri (non stratigrafico)</option>
              <option value="Feruglio">Feruglio (non stratigrafico)</option>
              <option value="Bizzarri-Binaco">Bizzarri-Binaco (stratigrafico)</option>
            </FormSelect>
          </FormField>
          <div className={!isStratigraphic ? 'opacity-50' : ''}>
              <FormField label="Unità Stratigrafica (US)">
                  <FormInput name="stratigraphic_unit" value={artifactData.stratigraphic_unit} onChange={handleInputChange} disabled={!isStratigraphic} />
              </FormField>
          </div>
          <FormField label="Datazione">
            <div className="space-y-2">
              <FormInput 
                name="dating" 
                value={artifactData.dating} 
                onChange={handleDatingChange}
                placeholder="es. 520 a.C. o secondo quarto VI sec. a.C."
              />
              <p className="text-xs text-gray-500">
                Inserisci una data (es. "520 a.C.") o un periodo già formattato. La conversione sarà automatica.
              </p>
            </div>
          </FormField>
        </div>
      </div>

      {/* Section 2: Descrizione Fisica */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Descrizione Fisica e Classificazione</h2>
          <CheckboxGroup label="Stato di Conservazione" options={artifactOptions.conservation_status} selectedOptions={artifactData.conservation_status} onChange={(val) => handleMultiSelectChange('conservation_status', val)} />
          <CheckboxGroup label="Oggetto" options={artifactOptions.object_type} selectedOptions={artifactData.object_type} onChange={(val) => handleMultiSelectChange('object_type', val)} />
          <FormField label="Materiale">
            <FormSelect name="material" value={artifactData.material} onChange={handleInputChange}>
                <option value="ceramica">Ceramica</option>
                <option value="metallo">Metallo</option>
                <option value="organico">Organico</option>
                <option value="vari">Vari</option>
            </FormSelect>
          </FormField>
          <CheckboxGroup label="Classe" options={artifactOptions.class_type[artifactData.material] || []} selectedOptions={artifactData.class_type} onChange={(val) => handleMultiSelectChange('class_type', val)} />
          <CheckboxGroup label="Forma" options={artifactOptions.shape[artifactData.material] || []} selectedOptions={artifactData.shape} onChange={(val) => handleMultiSelectChange('shape', val)} />
      </div>

      {/* Section 3: Dimensioni e Dati di Scavo */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Misure e Contesto</h2>
        <FormField label="Dimensioni (cm)">
            <div className="grid md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                <FormField label="Ø Orlo"><FormInput name="rim_diameter" value={artifactData.dimensions.rim_diameter} onChange={(e) => handleNestedInputChange('dimensions', 'rim_diameter', e.target.value)} /></FormField>
                <FormField label="Ø Fondo"><FormInput name="base_diameter" value={artifactData.dimensions.base_diameter} onChange={(e) => handleNestedInputChange('dimensions', 'base_diameter', e.target.value)} /></FormField>
                <FormField label="H Orlo"><FormInput name="rim_height" value={artifactData.dimensions.rim_height} onChange={(e) => handleNestedInputChange('dimensions', 'rim_height', e.target.value)} /></FormField>
                <FormField label="H Ansa"><FormInput name="handle_height" value={artifactData.dimensions.handle_height} onChange={(e) => handleNestedInputChange('dimensions', 'handle_height', e.target.value)} /></FormField>
            </div>
        </FormField>
        <FormField label="Dati di Scavo">
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <FormSelect name="source" value={artifactData.excavation_data.source} onChange={(e) => handleNestedInputChange('excavation_data', 'source', e.target.value)}>
                    <option value="Cartellino allegato">Cartellino allegato</option>
                    <option value="Note di scavo">Note di scavo</option>
                </FormSelect>
                <FormTextArea name="content" value={artifactData.excavation_data.content} onChange={(e) => handleNestedInputChange('excavation_data', 'content', e.target.value)} placeholder="Contenuto proveniente dalla fonte selezionata..." />
            </div>
        </FormField>
      </div>
      
      {/* Section 4: Descrizione Analitica */}
       <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Descrizione Analitica</h2>
        <FormField label="Descrizione">
            <FormTextArea name="description" value={artifactData.description} onChange={handleInputChange} rows={6} placeholder="Descrizione completa del reperto, incluse tecnica, decorazione, confronti, etc." />
        </FormField>
       </div>

      {/* Section 5: Documentazione Fotografica */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Documentazione Fotografica</h2>
        <ImageUploader 
          label="Immagini del Reperto"
          initialUrls={artifactData.artifact_images}
          onUrlsChange={handleImagesChange}
          maxFiles={5}
        />
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" disabled={isSaving} className="px-8 py-3 bg-amber-600 text-white font-bold rounded-lg shadow-lg hover:bg-amber-700 disabled:bg-amber-300 transition-all hover:scale-105">
          {isSaving ? "Aggiornamento..." : "Salva Modifiche"}
        </button>
      </div>
    </form>
    </div>
  );
}
