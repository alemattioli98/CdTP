
import React, { useState, useEffect } from "react";
import { Documentation } from "@/api/entities";
import { Tomb } from "@/api/entities";
import { Artifact } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, FileText, PlusCircle, Trash2 } from "lucide-react";

const FormField = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
);

const FormInput = (props) => (
    <input {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
);

const FormSelect = (props) => (
    <select {...props} className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
);

const FormTextArea = (props) => (
    <textarea {...props} rows="4" className="block w-full px-3 py-2 bg-white rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
);

export default function AddDocumentation() {
  const navigate = useNavigate();
  const [docData, setDocData] = useState({
    title: "",
    document_type: "Relazione di scavo",
    author: "",
    date: "",
    description: "",
    content: "",
    tomb_associations: [],
    artifact_associations: [],
    tags: [],
    bibliography: "",
    document_files: [],
    priority: "Media"
  });
  const [tombs, setTombs] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  const docEntity = Documentation.schema();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tombList, artifactList] = await Promise.all([
          Tomb.list('tomb_number'),
          Artifact.list('us_number')
        ]);
        setTombs(tombList);
        setArtifacts(artifactList);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleArrayChange = (field, index, value) => {
    const newArray = [...docData[field]];
    newArray[index] = value;
    setDocData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayField = (field, value = "") => {
    setDocData(prev => ({ ...prev, [field]: [...prev[field], value] }));
  };

  const removeArrayField = (field, index) => {
    const newArray = docData[field].filter((_, i) => i !== index);
    setDocData(prev => ({ ...prev, [field]: newArray }));
  };

  const addTag = () => {
    if (newTag.trim() !== "") {
      setDocData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docData.title || !docData.document_type) {
      alert("Il titolo e il tipo documento sono obbligatori.");
      return;
    }
    setIsSaving(true);
    try {
      const dataToSave = {
        ...docData,
        tomb_associations: docData.tomb_associations.filter(t => t),
        artifact_associations: docData.artifact_associations.filter(a => a),
        tags: docData.tags.filter(t => t),
        document_files: docData.document_files.filter(f => f)
      };
      await Documentation.create(dataToSave);
      navigate(createPageUrl("Documentation"));
    } catch (error) {
      console.error("Failed to save document:", error);
      alert("Si è verificato un errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-purple-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Aggiungi Documento</h1>
            <p className="text-purple-700 mt-1">Inserisci un nuovo documento nella bibliografia di scavo.</p>
          </div>
          <button type="button" onClick={() => navigate(createPageUrl("Documentation"))} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Annulla
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Informazioni Generali</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Titolo del Documento">
              <FormInput name="title" value={docData.title} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Tipo di Documento">
              <FormSelect name="document_type" value={docData.document_type} onChange={handleInputChange}>
                {docEntity.properties.document_type.enum.map(type => <option key={type} value={type}>{type}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="Autore">
              <FormInput name="author" value={docData.author} onChange={handleInputChange} />
            </FormField>
            <FormField label="Data">
              <FormInput type="date" name="date" value={docData.date} onChange={handleInputChange} />
            </FormField>
            <FormField label="Priorità">
              <FormSelect name="priority" value={docData.priority} onChange={handleInputChange}>
                {docEntity.properties.priority.enum.map(priority => <option key={priority} value={priority}>{priority}</option>)}
              </FormSelect>
            </FormField>
          </div>
          <div>
            <FormField label="Descrizione">
              <FormTextArea name="description" value={docData.description} onChange={handleInputChange} />
            </FormField>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Contenuto</h2>
          <FormField label="Contenuto del Documento">
            <FormTextArea name="content" value={docData.content} onChange={handleInputChange} rows="8" />
          </FormField>
          <FormField label="Bibliografia Correlata">
            <FormTextArea name="bibliography" value={docData.bibliography} onChange={handleInputChange} />
          </FormField>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Associazioni</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <FormField label="Tombe Associate">
                {docData.tomb_associations.map((tomb, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <FormSelect
                      value={tomb}
                      onChange={(e) => handleArrayChange('tomb_associations', index, e.target.value)}
                    >
                      <option value="">Seleziona una tomba</option>
                      {tombs.map(t => <option key={t.id} value={t.tomb_number}>{t.tomb_number} - {t.name}</option>)}
                    </FormSelect>
                    <button type="button" onClick={() => removeArrayField('tomb_associations', index)} className="p-2 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addArrayField('tomb_associations')} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-800">
                  <PlusCircle className="w-4 h-4" />
                  Aggiungi tomba
                </button>
              </FormField>
            </div>
            <div>
              <FormField label="Reperti Associati">
                {docData.artifact_associations.map((artifact, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <FormSelect
                      value={artifact}
                      onChange={(e) => handleArrayChange('artifact_associations', index, e.target.value)}
                    >
                      <option value="">Seleziona un reperto</option>
                      {artifacts.map(a => <option key={a.id} value={a.us_number}>US {a.us_number} - {a.shape}</option>)}
                    </FormSelect>
                    <button type="button" onClick={() => removeArrayField('artifact_associations', index)} className="p-2 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addArrayField('artifact_associations')} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-800">
                  <PlusCircle className="w-4 h-4" />
                  Aggiungi reperto
                </button>
              </FormField>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Tag e File</h2>
          <div>
            <FormField label="Tag">
              <div className="flex flex-wrap gap-2 mb-2">
                {docData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeArrayField('tags', index)} className="text-purple-600 hover:text-purple-800">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <FormInput
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Aggiungi tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  Aggiungi
                </button>
              </div>
            </FormField>
          </div>
          
          <FormField label="File Allegati (URL)">
            {docData.document_files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <FormInput
                  value={file}
                  onChange={(e) => handleArrayChange('document_files', index, e.target.value)}
                  placeholder="https://..."
                />
                <button type="button" onClick={() => removeArrayField('document_files', index)} className="p-2 text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addArrayField('document_files')} className="flex items-center gap-2 text-sm text-purple-600 font-medium hover:text-purple-800">
              <PlusCircle className="w-4 h-4" />
              Aggiungi file
            </button>
          </FormField>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSaving} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-sm hover:bg-purple-700 disabled:bg-purple-300 transition-colors">
            {isSaving ? "Salvataggio..." : "Salva Documento"}
          </button>
        </div>
      </form>
    </div>
  );
}
