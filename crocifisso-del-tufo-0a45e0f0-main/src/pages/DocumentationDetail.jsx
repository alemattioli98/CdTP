import React, { useState, useEffect } from "react";
import { Documentation } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, FileText, Calendar, User, Tag, ExternalLink, Book } from "lucide-react";

export default function DocumentationDetail() {
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocData = async () => {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const docId = urlParams.get('id');
      if (!docId) { navigate(createPageUrl("Documentation")); return; }
      
      try {
        const docData = await Documentation.get(docId);
        setDoc(docData);
      } catch (error) { console.error("Errore nel caricamento:", error); }
      setLoading(false);
    };
    fetchDocData();
  }, [window.location.search]);

  if (loading) return <div className="text-center py-12 text-gray-500">Caricamento documento...</div>;
  if (!doc) return <div className="text-center py-12 text-gray-500">Documento non trovato.</div>;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Media': return 'bg-yellow-100 text-yellow-800';
      case 'Bassa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-purple-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-purple-900">{doc.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                {doc.document_type}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(doc.priority)}`}>
                Priorità {doc.priority}
              </span>
            </div>
          </div>
          <Link to={createPageUrl("Documentation")} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Torna alla lista
          </Link>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {doc.description && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Descrizione</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.description}</p>
              </div>
            )}

            {doc.content && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-purple-700" />
                  Contenuto
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.content}</p>
                </div>
              </div>
            )}

            {doc.bibliography && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <Book className="w-6 h-6 text-indigo-700" />
                  Bibliografia
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{doc.bibliography}</p>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Informazioni</h3>
              <dl className="space-y-3">
                {doc.author && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Autore
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{doc.author}</dd>
                  </div>
                )}
                {doc.date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(doc.date).toLocaleDateString('it-IT')}</dd>
                  </div>
                )}
              </dl>
            </div>

            {doc.tags && doc.tags.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tag
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {((doc.tomb_associations && doc.tomb_associations.length > 0) || (doc.artifact_associations && doc.artifact_associations.length > 0)) && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Associazioni</h3>
                {doc.tomb_associations && doc.tomb_associations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Tombe</h4>
                    <div className="space-y-1">
                      {doc.tomb_associations.map((tomb, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-sm rounded mr-2">
                          {tomb}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {doc.artifact_associations && doc.artifact_associations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Reperti</h4>
                    <div className="space-y-1">
                      {doc.artifact_associations.map((artifact, index) => (
                        <span key={index} className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-sm rounded mr-2">
                          US {artifact}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {doc.document_files && doc.document_files.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">File Allegati</h3>
                <div className="space-y-2">
                  {doc.document_files.map((file, index) => (
                    <a
                      key={index}
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      File {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}