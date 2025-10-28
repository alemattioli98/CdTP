import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Tomb } from "@/api/entities";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, BookOpen, FileText, MapPin, Layers, Trash2 } from "lucide-react";
import TombPositioner from '../components/tomb/TombPositioner';
import ImageUploader from '../components/common/ImageUploader';

const FormField = ({ label, children, icon: Icon }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">{Icon && <Icon className="w-4 h-4 text-gray-500" />}{label}</label>{children}</div>);
const FormInput = (props) => (<input {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />);
const FormSelect = (props) => (<select {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />);
const FormTextArea = (props) => (<textarea {...props} rows="4" className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />);

export default function EditTomb() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tomb, setTomb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const necropolisMapUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6d5551934_PiantaNecropolidiCrocifissodelTufo.png";
  
  const tombId = new URLSearchParams(location.search).get('id');

  const tombEntity = useMemo(() => Tomb.schema(), []);

  useEffect(() => {
    if (!tombId) {
      navigate(createPageUrl("Tombs"));
      return;
    }
    const fetchTomb = async () => {
      setLoading(true);
      try {
        const tombData = await Tomb.get(tombId);
        const defaultTomb = Object.keys(tombEntity.properties).reduce((acc, key) => {
            const prop = tombEntity.properties[key];
            if (prop.type === 'array') acc[key] = [];
            else if (prop.type === 'object') acc[key] = {};
            else if (prop.type === 'boolean') acc[key] = false;
            else acc[key] = "";
            return acc;
        }, {});
        
        tombData.additional_images = Array.isArray(tombData.additional_images) ? tombData.additional_images : (tombData.additional_images ? [tombData.additional_images] : []);
        setTomb({ ...defaultTomb, ...tombData });
      } catch (error) {
        console.error("Failed to fetch tomb data:", error);
        navigate(createPageUrl("Tombs"));
      } finally {
        setLoading(false);
      }
    };
    fetchTomb();
  }, [tombId, navigate, tombEntity]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setTomb(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);
  
  const handleUrlsChange = useCallback((fieldName, urls) => {
    setTomb(prev => ({ ...prev, [fieldName]: fieldName === 'additional_images' ? urls : (urls[0] || "") }));
  }, []);

  const handleNestedInputChange = useCallback((parent, name, value) => {
    setTomb(prev => ({ ...prev, [parent]: { ...prev[parent], [name]: value } }));
  }, []);

  const handlePositionChange = useCallback((points) => {
    setTomb(prev => ({ ...prev, shape_coordinates: points }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { id, created_date, updated_date, created_by, ...dataToSave } = tomb;
      await Tomb.update(tombId, dataToSave);
      navigate(createPageUrl(`TombDetail?id=${tombId}`));
    } catch (error) {
      console.error("Failed to update tomb:", error);
      alert("Si è verificato un errore durante l'aggiornamento.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Sei sicuro di voler eliminare questa tomba? L'azione è irreversibile.")) {
      setIsDeleting(true);
      try {
        await Tomb.delete(tombId);
        navigate(createPageUrl("Tombs"));
      } catch (error) {
        console.error("Failed to delete tomb:", error);
        alert("Si è verificato un errore durante l'eliminazione.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Caricamento...</p></div>;
  if (!tomb) return <div className="text-center p-8">Tomba non trovata.</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifica Tomba</h1>
            <p className="text-gray-600 mt-1">Aggiorna i dettagli per: {tomb.Numero_tomba}</p>
          </div>
          <button type="button" onClick={() => navigate(createPageUrl(`TombDetail?id=${tombId}`))} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Annulla
          </button>
      </div>

       <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Informazioni Principali</h2>
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <FormField label="Numero Tomba (ID)"><FormInput name="Numero_tomba" value={tomb.Numero_tomba} onChange={handleInputChange} required /></FormField>
          <FormField label="Datazione"><FormSelect name="datazione" value={tomb.datazione} onChange={handleInputChange}>{tombEntity.properties.datazione.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
          <FormField label="Localizzazione (testuale)"><FormInput name="localizzazione" value={tomb.localizzazione} onChange={handleInputChange} placeholder="es. Settore Nord-Est" /></FormField>
          <FormField label="Dimensioni"><FormInput name="dimensioni" value={tomb.dimensioni} onChange={handleInputChange} placeholder="es. 3.2 x 2.8 x 2.1 m" /></FormField>
          <div className="md:col-span-2"><FormField label="Descrizione" icon={FileText}><FormTextArea name="descrizione" value={tomb.descrizione} onChange={handleInputChange} /></FormField></div>
        </div>
      </div>
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Epigrafia</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-3"><input type="checkbox" id="has_epigraphy" name="has_epigraphy" checked={tomb.has_epigraphy} onChange={handleInputChange} className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" /><label htmlFor="has_epigraphy" className="text-sm font-medium text-gray-700">Tomba con epigrafia?</label></div>
          {tomb.has_epigraphy && (
            <div className="grid md:grid-cols-1 gap-6 pt-4 border-t border-gray-100">
              <FormField label="Nome (da iscrizione)"><FormInput name="Nome" value={tomb.Nome} onChange={handleInputChange} placeholder="es. hescanas" /></FormField>
              <ImageUploader 
                label="Foto/Rilievo dell'Iscrizione"
                initialUrls={tomb.epigraphy_photo ? [tomb.epigraphy_photo] : []}
                onUrlsChange={(urls) => handleUrlsChange('epigraphy_photo', urls)}
                maxFiles={1}
              />
              <FormField label="Traslitterazione"><FormTextArea name="epigraphy_transliteration" value={tomb.epigraphy_transliteration} onChange={handleInputChange} placeholder="Inserisci la traslitterazione dell'iscrizione..." /></FormField>
              <FormField label="Descrizione e Interpretazione"><FormTextArea name="epigraphy_description" value={tomb.epigraphy_description} onChange={handleInputChange} placeholder="Descrizione e interpretazione dell'iscrizione..." /></FormField>
              <div className="grid md:grid-cols-2 gap-6"><FormField label="Riferimento CIE"><FormInput name="epigraphy_cie_reference" value={tomb.epigraphy_cie_reference} onChange={handleInputChange} placeholder="es. CIE 5424" /></FormField><FormField label="Bibliografia Specifica"><FormInput name="epigraphy_bibliography" value={tomb.epigraphy_bibliography} onChange={handleInputChange} placeholder="Bibliografia relativa all'iscrizione..." /></FormField></div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Altre Numerazioni</h2>
        <div className="grid md:grid-cols-3 gap-x-8 gap-y-6">
            <FormField label="Klakowicz"><FormInput name="Klakowicz" value={tomb.altre_numerazioni.Klakowicz} onChange={(e) => handleNestedInputChange('altre_numerazioni', 'Klakowicz', e.target.value)} /></FormField>
            <FormField label="Bizzarri"><FormInput name="Bizzarri" value={tomb.altre_numerazioni.Bizzarri} onChange={(e) => handleNestedInputChange('altre_numerazioni', 'Bizzarri', e.target.value)} /></FormField>
            <FormField label="Scavo-Feruglio"><FormInput name="Scavo_Feruglio" value={tomb.altre_numerazioni['Scavo_Feruglio']} onChange={(e) => handleNestedInputChange('altre_numerazioni', 'Scavo_Feruglio', e.target.value)} /></FormField>
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
            initialCoordinates={tomb.shape_coordinates}
          />
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4 flex items-center gap-3"><Layers className="w-6 h-6 text-blue-600" />Tipologia Tomba</h2>
          <div className="space-y-6">
            <FormField label="Tipologia Principale"><FormSelect name="tipologia_tomba" value={tomb.tipologia_tomba} onChange={handleInputChange}>{tombEntity.properties.tipologia_tomba.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
            {tomb.tipologia_tomba === 'tomba a camera' && (
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <FormField label="Tipologia Copertura"><FormSelect name="sottotipo_copertura" value={tomb.sottotipo_copertura} onChange={handleInputChange}><option value="">Seleziona...</option>{tombEntity.properties.sottotipo_copertura.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
                <FormField label="Tipologia Banchine"><FormSelect name="sottotipo_banchine" value={tomb.sottotipo_banchine} onChange={handleInputChange}><option value="">Seleziona...</option>{tombEntity.properties.sottotipo_banchine.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
              </div>
            )}
            {tomb.tipologia_tomba === 'tomba a cassetta' && (<div className="pt-4 border-t border-gray-100"><FormField label="Sottotipo Cassetta"><FormSelect name="sottotipo_cassetta" value={tomb.sottotipo_cassetta} onChange={handleInputChange}><option value="">Seleziona...</option>{tombEntity.properties.sottotipo_cassetta.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField></div>)}
            <FormField label="Condizione di Conservazione"><FormSelect name="condizione_conservazione" value={tomb.condizione_conservazione} onChange={handleInputChange}>{tombEntity.properties.condizione_conservazione.enum.map(p => <option key={p} value={p}>{p}</option>)}</FormSelect></FormField>
          </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Appunti e Bibliografia</h2>
        <div className="space-y-6">
          <FormField label="Appunti di Scavo"><FormTextArea name="appunti_di_scavo" value={tomb.appunti_di_scavo} onChange={handleInputChange} placeholder="Note e osservazioni dallo scavo..." /></FormField>
          <FormField label="Note Bibliografiche"><FormTextArea name="bibliography_notes" value={tomb.bibliography_notes} onChange={handleInputChange} placeholder="Riferimenti bibliografici..." /></FormField>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Documentazione Fotografica</h2>
            <div className="grid md:grid-cols-1 gap-6">
                <ImageUploader label="Foto Tomba" initialUrls={tomb.tomb_photo ? [tomb.tomb_photo] : []} onUrlsChange={(urls) => handleUrlsChange('tomb_photo', urls)} maxFiles={1} />
                <ImageUploader label="Foto Pianta" initialUrls={tomb.plan_photo ? [tomb.plan_photo] : []} onUrlsChange={(urls) => handleUrlsChange('plan_photo', urls)} maxFiles={1} />
                <ImageUploader label="Foto Rilievo Scavo" initialUrls={tomb.excavation_photo ? [tomb.excavation_photo] : []} onUrlsChange={(urls) => handleUrlsChange('excavation_photo', urls)} maxFiles={1} />
                <ImageUploader label="Immagini Aggiuntive" initialUrls={tomb.additional_images} onUrlsChange={(urls) => handleUrlsChange('additional_images', urls)} maxFiles={10} />
            </div>
      </div>
        
      <div className="flex justify-between items-center pt-4">
        <button type="button" onClick={handleDelete} disabled={isDeleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow-sm hover:bg-red-700 disabled:bg-red-300 transition-colors">
          <Trash2 className="w-5 h-5" />
          {isDeleting ? "Eliminazione..." : "Elimina Tomba"}
        </button>
        <button type="submit" disabled={isSaving} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors">
          {isSaving ? "Salvataggio..." : "Salva Modifiche"}
        </button>
      </div>
    </form>
  );
}