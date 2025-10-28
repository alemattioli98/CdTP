import React, { useState, useEffect } from 'react';
import { Artifact } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Package } from 'lucide-react';

export default function SimilarArtifacts({ currentArtifact }) {
    const [similarArtifacts, setSimilarArtifacts] = useState([]);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentArtifact) {
            fetchAndSummarize();
        }
    }, [currentArtifact]);

    const fetchAndSummarize = async () => {
        setLoading(true);

        try {
            // Fetch similar artifacts (same class_type and shape, different id)
            const filters = {
                class_type: currentArtifact.class_type,
                shape: currentArtifact.shape
            };
            const allInClass = await Artifact.filter(filters, '-created_date', 20);
            const similar = allInClass.filter(a => a.id !== currentArtifact.id).slice(0, 5); // Limit to 5 for performance
            
            setSimilarArtifacts(similar);

            if (similar.length > 0) {
                // Prepare data for LLM
                const artifactsForPrompt = similar.map(a => ({
                    forma: a.shape,
                    classe: a.class_type,
                    descrizione: a.description,
                    us: a.us_number
                }));
                
                const prompt = `Dato il seguente elenco di reperti archeologici in formato JSON, simili a un ${currentArtifact.shape} in ${currentArtifact.class_type}, crea un breve riassunto analitico di 2-3 frasi che evidenzi le somiglianze e le differenze comuni. Sii conciso e accademico. Ecco i dati: ${JSON.stringify(artifactsForPrompt)}`;

                const aiSummary = await InvokeLLM({ prompt: prompt });
                setSummary(aiSummary);
            } else {
                 setSummary("Nessun reperto simile trovato per un confronto.");
            }
        } catch (error) {
            console.error("Error fetching or summarizing similar artifacts:", error);
            setSummary("Impossibile generare il riassunto a causa di un errore.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Confronto con Reperti Simili
            </h2>
            
            {loading ? (
                <div>
                     <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-2"></div>
                     <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
            ) : (
                <p className="text-gray-700 leading-relaxed mb-6">{summary}</p>
            )}

            {similarArtifacts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {similarArtifacts.map(artifact => (
                        <Link 
                            to={createPageUrl(`ArtifactDetail?id=${artifact.id}`)} 
                            key={artifact.id}
                            className="block bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-white transition-all group"
                        >
                            {artifact.artifact_photos && artifact.artifact_photos.length > 0 ? (
                                <img src={artifact.artifact_photos[0]} alt={artifact.shape} className="w-full aspect-square object-cover rounded-md mb-2" />
                            ) : (
                                <div className="w-full aspect-square bg-gray-200 rounded-md mb-2 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            <h4 className="font-semibold text-sm text-gray-800 truncate">{artifact.shape}</h4>
                            <p className="text-xs text-gray-500">US {artifact.us_number}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}