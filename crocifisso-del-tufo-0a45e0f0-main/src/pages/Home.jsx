
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Package, FileText, Plus, Search, TrendingUp,
  Database, BarChart3, Eye,
  ChevronRight, X
} from 'lucide-react';
import { Tomb } from '@/api/entities';
import { Artifact } from '@/api/entities';
import { Documentation } from '@/api/entities';
import TodoList from '../components/tasks/TodoList';
import TombIcon from '../components/icons/TombIcon';
import KantharosIcon from '../components/icons/KantharosIcon';
import { motion } from 'framer-motion';

export default function Home() {
  const [stats, setStats] = useState({ tombs: 0, artifacts: 0, docs: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState(null);

  const necropolisImageUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e7111043d_2-9-scaled.jpg";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tombs, artifacts, docs] = await Promise.all([
        Tomb.list('-created_date', 5),
        Artifact.list('-created_date', 5),
        Documentation.list('-created_date', 5)
      ]);

      const [totalTombs, totalArtifacts, totalDocs] = await Promise.all([
          Tomb.list(),
          Artifact.list(),
          Documentation.list()
      ]);

      setStats({
        tombs: totalTombs.length,
        artifacts: totalArtifacts.length,
        docs: totalDocs.length
      });

      const recent = [
        ...tombs.map(t => ({ ...t, type: 'tomba', icon: TombIcon, url: createPageUrl(`TombDetail?id=${t.id}`), title: t.Nome || `Tomba ${t.Numero_tomba}` })),
        ...artifacts.map(a => ({ ...a, type: 'reperto', icon: KantharosIcon, url: createPageUrl(`ArtifactDetail?id=${a.id}`), title: `${a.shape} (US ${a.us_number})` })),
        ...docs.map(d => ({ ...d, type: 'documento', icon: FileText, url: createPageUrl(`DocumentationDetail?id=${d.id}`), title: d.title }))
      ].sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()).slice(0, 8);

      setRecentActivity(recent);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const performSearch = useCallback(async (term) => {
    if (!term.trim()) {
      fetchData();
      return;
    }

    setLoading(true);
    try {
      const lowerCaseTerm = term.toLowerCase();
      const [tombs, artifacts, docs] = await Promise.all([
        Tomb.list(), Artifact.list(), Documentation.list()
      ]);

      const searchResults = [
        ...tombs.filter(t => JSON.stringify(t).toLowerCase().includes(lowerCaseTerm)).map(t => ({ ...t, type: 'tomba', icon: TombIcon, url: createPageUrl(`TombDetail?id=${t.id}`), title: t.Nome || `Tomba ${t.Numero_tomba}` })),
        ...artifacts.filter(a => JSON.stringify(a).toLowerCase().includes(lowerCaseTerm)).map(a => ({ ...a, type: 'reperto', icon: KantharosIcon, url: createPageUrl(`ArtifactDetail?id=${a.id}`), title: `${a.shape} (US ${a.us_number})` })),
        ...docs.filter(d => JSON.stringify(d).toLowerCase().includes(lowerCaseTerm)).map(d => ({ ...d, type: 'documento', icon: FileText, url: createPageUrl(`DocumentationDetail?id=${d.id}`), title: d.title }))
      ];

      setRecentActivity(searchResults.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()).slice(0, 10));
    } catch (error) {
      console.error("Error performing search:", error);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch(searchTerm);
      navigate(`?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchData();
    navigate(createPageUrl('Home'));
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      performSearch(searchParam);
    } else {
      fetchData();
    }
  }, [fetchData, performSearch]);

  const apps = [
    { title: "Tombe", description: `${stats.tombs} catalogate`, icon: TombIcon, viewUrl: createPageUrl("Tombs"), addUrl: createPageUrl("AddTomb"), color: "from-emerald-500 to-green-600", stats: stats.tombs },
    { title: "Reperti", description: `${stats.artifacts} studiati`, icon: KantharosIcon, viewUrl: createPageUrl("Artifacts"), addUrl: createPageUrl("AddArtifact"), color: "from-amber-500 to-orange-600", stats: stats.artifacts },
    { title: "Documentazione", description: `${stats.docs} documenti`, icon: FileText, viewUrl: createPageUrl("Documentation"), addUrl: createPageUrl("AddDocumentation"), color: "from-purple-500 to-violet-600", stats: stats.docs },
  ];

  const handlePlusClick = (appTitle) => {
    setExpandedCard(expandedCard === appTitle ? null : appTitle);
  };

  const TouchOptimizedCard = ({ app }) => {
    const isExpanded = expandedCard === app.title;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Link
              to={app.viewUrl}
              className="flex items-center gap-4 flex-1 touch-manipulation"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-sm`}>
                <app.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{app.title}</h3>
                <p className="text-sm text-gray-500">{app.description}</p>
              </div>
            </Link>

            <button
              onClick={() => handlePlusClick(app.title)}
              className={`ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation group ${
                isExpanded
                  ? 'bg-blue-100 text-blue-600 transform rotate-45'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Plus className="w-5 h-5 transition-colors" />
            </button>
          </div>
        </div>

        {/* Expanded Options */}
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
            <div className="pt-4 grid grid-cols-2 gap-3">
              <Link
                to={app.viewUrl}
                onClick={() => setExpandedCard(null)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-all duration-200 touch-manipulation group"
              >
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Vai alla pagina</span>
                  <p className="text-xs text-gray-500">Visualizza tutti</p>
                </div>
              </Link>

              <Link
                to={app.addUrl}
                onClick={() => setExpandedCard(null)}
                className="flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-green-50 hover:border-green-200 border border-gray-200 transition-all duration-200 touch-manipulation group"
              >
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">Aggiungi record</span>
                  <p className="text-xs text-gray-500">Crea nuovo</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header - Improved spacing and typography */}
      <motion.div
        variants={itemVariants}
        className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center text-center p-8 bg-cover bg-center"
        style={{backgroundImage: `url(${necropolisImageUrl})`}}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative z-10 text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
            Necropoli di Crocifisso del Tufo
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-md leading-relaxed">
            Database digitale per la catalogazione e lo studio
          </p>
        </div>
      </motion.div>

      {/* Search Bar - Better positioning and spacing */}
      <motion.div variants={itemVariants} className="max-w-2xl mx-auto -mt-12 md:-mt-16 relative z-20 px-4 md:px-0">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca ovunque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="w-full pl-16 pr-16 py-5 text-base md:text-lg bg-white rounded-2xl border border-gray-200 shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 touch-manipulation"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 touch-manipulation rounded-full hover:bg-gray-100 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Touch-Optimized Cards */}
      <div className="space-y-4">
        {apps.map((app) => (
          <motion.div key={app.title} variants={itemVariants}>
            <TouchOptimizedCard app={app} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Area - Better spacing and hierarchy */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Activity - Improved card design */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-100">
               <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                 <TrendingUp className="w-6 h-6 text-blue-600" />
                 {searchTerm ? 'Risultati Ricerca' : 'Attività Recente'}
               </h2>
             </div>
             <div className="p-6 space-y-4">
               {loading ? (
                 <div className="text-center py-12">
                   <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-gray-500">Caricamento...</p>
                 </div>
               ) : recentActivity.length > 0 ? (
                 <div className="space-y-3">
                   {recentActivity.map((item) => (
                     <Link key={`${item.type}-${item.id}`} to={item.url} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 group touch-manipulation transition-all duration-200 hover:shadow-sm">
                       <div className="p-3 bg-white rounded-lg shadow-sm flex-shrink-0">
                          <item.icon className="w-5 h-5 text-gray-600" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className="font-semibold text-gray-900 truncate text-base">{item.title}</h4>
                         <p className="text-sm text-gray-500 capitalize truncate">{item.type}</p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors duration-200" />
                     </Link>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Package className="w-6 h-6 text-gray-400" />
                   </div>
                   <p className="text-gray-500 font-medium">Nessun risultato</p>
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* Stats and Todo - Improved card design */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Statistiche
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Tombe</span>
                <span className="font-bold text-2xl text-emerald-600">{stats.tombs}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Reperti</span>
                <span className="font-bold text-2xl text-amber-600">{stats.artifacts}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Documenti</span>
                <span className="font-bold text-2xl text-purple-600">{stats.docs}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Promemoria</h2>
            </div>
            <div className="p-6">
              <TodoList />
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
