
import React, { useState, useCallback, useEffect } from "react";
import { Tomb } from "@/api/entities";
import { useNavigate, useParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BookOpen, FileText, MapPin, Layers, Loader2 } from "lucide-react";
import TombPositioner from '../components/tomb/TombPositioner';
import ImageUploader from '../components/common/ImageUploader';

// Helper components moved to the top as per outline
const FormField = ({ label, children, icon: Icon }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">{Icon && <Icon className="w-4 h-4 text-gray-500" />}{label}</label>{children}</div>);
const FormInput = (props) => (<input {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />);
const FormSelect = (props) => (<select {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />);
const FormTextArea = (props) => (<textarea {...props} rows="4" className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />);

// Define default state for a new tomb
const DEFAULT_TOMB_STATE = {
  Numero_tomba: "",
  altre_numerazioni: { Klakowicz: "", Bizzarri: "", "Scavo_Feruglio": "" },
  Nome: "",
  has_epigraphy: false,
  epigraphy_photo: "",
  epigraphy_transliteration: "",
  epigraphy_description: "",
  epigraphy_cie_reference: "",
  epigraphy_bibliography: "",
  datazione: "secondo quarto VI sec. a.C.",
  localizzazione: "",
  tipologia_tomba: "tomba a camera",
  sottotipo_copertura: "",
  sottotipo_banchine: "",
  sottotipo_cassetta: "",
  dimensioni: "",
  descrizione: "",
  appunti_di_scavo: "",
  bibliography_notes: "",
  condizione_conservazione: "Buona",
  tomb_photo: "",
  plan_photo: "",
  excavation_photo: "",
  additional_images: [],
  shape_coordinates: []
};

export default function AddTomb() {
  const { id } = useParams(); // Get ID from URL parameters for edit mode
  const navigate = useNavigate();

  const [tombData, setTombData] = useState(DEFAULT_TOMB_STATE);
  const [isLoading, setIsLoading] = useState(true); // State for data loading in edit mode
  const [isSaving, setIsSaving] = useState(false);
  const necropolisMapUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d5551934_PiantaNecropolidiCrocifissodelTufo.png";

  const tombEntity = Tomb.schema();

  // Effect to fetch tomb data when in edit mode (i.e., 'id' is present)
  useEffect(() => {
    const fetchTomb = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const fetchedTomb = await Tomb.get(id);
          if (fetchedTomb) {
            // Ensure nested objects and array fields are properly initialized
            fetchedTomb.altre_numerazioni = fetchedTomb.altre_numerazioni || DEFAULT_TOMB_STATE.altre_numerazioni;
            fetchedTomb.additional_images = fetchedTomb.additional_images || [];
            fetchedTomb.shape_coordinates = fetchedTomb.shape_coordinates || [];

            setTombData(fetchedTomb);
          } else {
            console.warn(`Tomb with ID ${id} not found. Redirecting to Add Tomb.`);
            navigate(createPageUrl("AddTomb"), { replace: true }); // Redirect to add page if not found
          }
        } catch (error) {
          console.error("Failed to fetch tomb:", error);
          alert("Si è verificato un errore durante il caricamento della tomba.");
          navigate(createPageUrl("Tombs"), { replace: true }); // Go back to list on error
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no ID, it's an add operation, so ensure default state is set
        setTombData(DEFAULT_TOMB_STATE);
        setIsLoading(false);
      }
    };
    fetchTomb();
  }, [id, navigate]); // The dependencies 'id' and 'navigate' are correctly listed.
                      // DEFAULT_TOMB_STATE and createPageUrl are module-level constants/imports,
                      // and thus stable, not requiring inclusion in dependencies.

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setTombData(prev => {
      const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'tipologia_tomba') {
        newData.sottotipo_copertura = "";
        newData.sottotipo_banchine = "";
        newData.sottotipo_cassetta = "";
      }
      return newData;
    });
  }, []);
  
  const handleUrlsChange = useCallback((fieldName, urls) => {
    setTombData(prev => {
      // For fields with maxFiles=1, store as a single string, otherwise as an array
      const newValue = (fieldName === 'additional_images') ? urls : (urls.length > 0 ? urls[0] : "");
      return { ...prev, [fieldName]: newValue };
    });
  }, []);

  const handleNestedInputChange = useCallback((parent, name, value) => {
    setTombData(prev => ({ ...prev, [parent]: { ...prev[parent], [name]: value } }));
  }, []);
  
  const handlePositionChange = useCallback((points) => {
    setTombData(prev => ({ ...prev, shape_coordinates: points }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tombData.Numero_tomba) {
      alert("Il Numero Tomba è obbligatorio.");
      return;
    }
    setIsSaving(true);
    try {
      if (id) {
        // If ID exists, update the existing tomb
        await Tomb.update(id, tombData);
        alert("Tomba aggiornata con successo!");
      } else {
        // Otherwise, create a new tomb
        await Tomb.create(tombData);
        alert("Tomba aggiunta con successo!");
      }
      navigate(createPageUrl("Tombs"));
    } catch (error) {
      console.error(`Failed to ${id ? 'update' : 'save'} tomb:`, error);
      alert("Si è verificato un errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show a loading indicator while fetching data in edit mode
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700">
        Caricamento dati tomba...
      </div>
    );
  }

  // Determine page title and button text based on whether it's add or edit mode
  const pageTitle = id ? "Modifica Tomba" : "Aggiungi Nuova Tomba";
  const pageDescription = id ? "Aggiorna i dettagli per questa voce nel catalogo." : "Inserisci i dettagli per una nuova voce nel catalogo.";
  const saveButtonText = id ? "Salva Modifiche" : "Salva Tomba";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-1">{pageDescription}</p>
        </div>
        <button type="button" onClick={() => navigate(createPageUrl("Tombs"))} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Annulla
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Informazioni Principali</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <FormField label="Numero Tomba (ID)"><FormInput name="Numero_tomba" value={tombData.Numero_tomba} onChange={handleInputChange} required /></FormField>
          <FormField label="Datazione"><FormSelect name="datazione" value={tombData.datazione} onChange={handleInputChange}>{tombEntity.properties.datazione.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
          <FormField label="Localizzazione (testuale)"><FormInput name="localizzazione" value={tombData.localizzazione} onChange={handleInputChange} placeholder="es. Settore Nord-Est" /></FormField>
          <FormField label="Dimensioni"><FormInput name="dimensioni" value={tombData.dimensioni} onChange={handleInputChange} placeholder="es. 3.2 x 2.8 x 2.1 m" /></FormField>
          <div className="md:col-span-2"><FormField label="Descrizione" icon={FileText}><FormTextArea name="descrizione" value={tombData.descrizione} onChange={handleInputChange} /></FormField></div>
        </div>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Epigrafia</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-3"><input type="checkbox" id="has_epigraphy" name="has_epigraphy" checked={tombData.has_epigraphy} onChange={handleInputChange} className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" /><label htmlFor="has_epigraphy" className="text-sm font-medium text-gray-700">Tomba con epigrafia?</label></div>
          {tombData.has_epigraphy && (
            <div className="grid md:grid-cols-1 gap-6 pt-4 border-t border-gray-100">
              <FormField label="Nome (da iscrizione)"><FormInput name="Nome" value={tombData.Nome} onChange={handleInputChange} placeholder="es. hescanas" /></FormField>
              <ImageUploader 
                label="Foto/Rilievo dell'Iscrizione"
                initialUrls={tombData.epigraphy_photo ? [tombData.epigraphy_photo] : []}
                onUrlsChange={(urls) => handleUrlsChange('epigraphy_photo', urls)}
                maxFiles={1}
              />
              <FormField label="Traslitterazione"><FormTextArea name="epigraphy_transliteration" value={tombData.epigraphy_transliteration} onChange={handleInputChange} placeholder="Inserisci la traslitterazione dell'iscrizione..." /></FormField>
              <FormField label="Descrizione e Interpretazione"><FormTextArea name="epigraphy_description" value={tombData.epigraphy_description} onChange={handleInputChange} placeholder="Descrizione e interpretazione dell'iscrizione..." /></FormField>
              <div className="grid md:grid-cols-2 gap-6"><FormField label="Riferimento CIE"><FormInput name="epigraphy_cie_reference" value={tombData.epigraphy_cie_reference} onChange={handleInputChange} placeholder="es. CIE 5424" /></FormField><FormField label="Bibliografia Specifica"><FormInput name="epigraphy_bibliography" value={tombData.epigraphy_bibliography} onChange={handleInputChange} placeholder="Bibliografia relativa all'iscrizione..." /></FormField></div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Altre Numerazioni</h2>
        <div className="grid md:grid-cols-3 gap-x-8 gap-y-6">
            <FormField label="Klakowicz"><FormInput name="Klakowicz" value={tombData.altre_numerazioni.Klakowicz} onChange={(e) => handleNestedInputChange('altre_numerazioni', 'Klakowicz', e.target.value)} /></FormField>
            <FormField label="Bizzarri"><FormInput name="Bizzarri" value={tombData.altre_numerazioni.Bizzarri} onChange={(e) => handleNestedInputChange('altre_numerazioni', 'Bizzarri', e.target.value)} /></FormField>
            <FormField label="Scavo-Feruglio"><FormInput name="Scavo_Feruglio" value={tombData.altre_numerazioni.Scavo_Feruglio} onChange={(e) => handleNestedInputChange('altre_numerazioni', 'Scavo_Feruglio', e.target.value)} /></FormField>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-emerald-600" />
              Posizionamento su Mappa
          </h2>
          <TombPositioner 
            mapUrl={necropolisMapUrl}
            onPositionChange={handlePositionChange}
            initialCoordinates={tombData.shape_coordinates}
          />
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4 flex items-center gap-3"><Layers className="w-6 h-6 text-blue-600" />Tipologia Tomba</h2>
          <div className="space-y-6">
            <FormField label="Tipologia Principale"><FormSelect name="tipologia_tomba" value={tombData.tipologia_tomba} onChange={handleInputChange}>{tombEntity.properties.tipologia_tomba.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
            {tombData.tipologia_tomba === 'tomba a camera' && (
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <FormField label="Tipologia Copertura"><FormSelect name="sottotipo_copertura" value={tombData.sottotipo_copertura} onChange={handleInputChange}><option value="">Seleziona...</option>{tombEntity.properties.sottotipo_copertura.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
                <FormField label="Tipologia Banchine"><FormSelect name="sottotipo_banchine" value={tombData.sottotipo_banchine} onChange={handleInputChange}><option value="">Seleziona...</option>{tombEntity.properties.sottotipo_banchine.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
              </div>
            )}
            {tombData.tipologia_tomba === 'tomba a cassetta' && (<div className="pt-4 border-t border-gray-100"><FormField label="Sottotipo Cassetta"><FormSelect name="sottotipo_cassetta" value={tombData.sottotipo_cassetta} onChange={handleInputChange}><option value="">Seleziona...</option>{tombEntity.properties.sottotipo_cassetta.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField></div>)}
            <FormField label="Condizione di Conservazione"><FormSelect name="condizione_conservazione" value={tombData.condizione_conservazione} onChange={handleInputChange}>{tombEntity.properties.condizione_conservazione.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
          </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Appunti e Bibliografia</h2>
        <div className="space-y-6">
          <FormField label="Appunti di Scavo"><FormTextArea name="appunti_di_scavo" value={tombData.appunti_di_scavo} onChange={handleInputChange} placeholder="Note e osservazioni dallo scavo..." /></FormField>
          <FormField label="Note Bibliografiche"><FormTextArea name="bibliography_notes" value={tombData.bibliography_notes} onChange={handleInputChange} placeholder="Riferimenti bibliografici..." /></FormField>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Documentazione Fotografica</h2>
            <div className="grid md:grid-cols-1 gap-6">
                <ImageUploader label="Foto Tomba" initialUrls={tombData.tomb_photo ? [tombData.tomb_photo] : []} onUrlsChange={(urls) => handleUrlsChange('tomb_photo', urls)} maxFiles={1} />
                <ImageUploader label="Foto Pianta" initialUrls={tombData.plan_photo ? [tombData.plan_photo] : []} onUrlsChange={(urls) => handleUrlsChange('plan_photo', urls)} maxFiles={1} />
                <ImageUploader label="Foto Rilievo Scavo" initialUrls={tombData.excavation_photo ? [tombData.excavation_photo] : []} onUrlsChange={(urls) => handleUrlsChange('excavation_photo', urls)} maxFiles={1} />
                <ImageUploader label="Immagini Aggiuntive" initialUrls={tombData.additional_images} onUrlsChange={(urls) => handleUrlsChange('additional_images', urls)} maxFiles={10} />
            </div>
      </div>
        
      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isSaving} 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors w-40"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : saveButtonText}
        </button>
      </div>
    </form>
  );
}
