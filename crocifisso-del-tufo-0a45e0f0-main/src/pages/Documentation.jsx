
import React, { useState, useEffect } from "react";
import { Documentation } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Plus, FileText, Calendar, User, Tag, ChevronRight, Book } from "lucide-react";

export default function DocumentationPage() {
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    document_type: "",
    priority: "",
    author: ""
  });

  const docEntity = Documentation.schema();

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    setLoading(true);
    let filtered = docs.filter(doc => {
      const matchesSearch = !searchTerm || 
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !filters.document_type || doc.document_type === filters.document_type;
      const matchesPriority = !filters.priority || doc.priority === filters.priority;
      const matchesAuthor = !filters.author || doc.author?.toLowerCase().includes(filters.author.toLowerCase());

      return matchesSearch && matchesType && matchesPriority && matchesAuthor;
    });
    setFilteredDocs(filtered);
    setLoading(false);
  }, [docs, searchTerm, filters]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await Documentation.list('-created_date');
      setDocs(data);
      setFilteredDocs(data);
    } catch (error) {
      console.error("Errore nel caricamento dei documenti:", error);
    }
    setLoading(false);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Bassa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Relazione di scavo':
      case 'Diario di scavo':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Articolo scientifico':
      case 'Bibliografia':
        return <Book className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const DocumentCard = ({ doc }) => (
    <Link 
      to={createPageUrl(`DocumentationDetail?id=${doc.id}`)}
      className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 hover:border-purple-500 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-purple-50 rounded-lg flex-shrink-0">
                {getTypeIcon(doc.document_type)}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {doc.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {doc.description || "Nessuna descrizione disponibile."}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {doc.document_type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(doc.priority)}`}>
                        Priorità {doc.priority}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    {doc.author && (
                        <div className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            <span>{doc.author}</span>
                        </div>
                    )}
                    {doc.date && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(doc.date).toLocaleDateString('it-IT')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0 ml-2" />
      </div>
    </Link>
  );

  const FilterSelect = ({ value, onChange, placeholder, options }) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
    >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  return (
    <div className="space-y-8 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 drop-shadow-sm">Documentazione e Bibliografia</h1>
          <p className="text-gray-700 mt-1 font-medium">
            Gestisci relazioni di scavo, bibliografia e documentazione scientifica.
          </p>
        </div>
        <Link 
          to={createPageUrl("AddDocumentation")}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-sm hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Aggiungi Documento</span>
        </Link>
      </div>

      <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/50 space-y-4 shadow-lg">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per titolo, autore o descrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
             <FilterSelect 
                value={filters.document_type}
                onChange={(e) => handleFilterChange('document_type', e.target.value)}
                placeholder="Filtra per tipo"
                options={docEntity.properties.document_type.enum}
             />
             <FilterSelect 
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                placeholder="Filtra per priorità"
                options={docEntity.properties.priority.enum}
             />
             <input
                type="text"
                placeholder="Filtra per autore..."
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                className="w-full bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
             />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
            <p>Caricamento...</p>
        </div>
      ) : (
        <div className="grid gap-6">
            {filteredDocs.length > 0 ? (
            filteredDocs.map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
            ))
            ) : (
            <div className="text-center bg-white/70 p-12 rounded-xl border border-white/50">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Nessun documento trovato</h3>
                <p className="text-gray-500 mt-2">
                    Prova a modificare i filtri di ricerca o aggiungi un nuovo documento.
                </p>
            </div>
            )}
        </div>
      )}
    </div>
  );
}
