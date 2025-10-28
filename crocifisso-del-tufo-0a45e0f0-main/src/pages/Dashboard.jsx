
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Layers, Package, FileText, ArrowRight, TrendingUp, ChevronRight, Plus, Clock, CheckCircle } from 'lucide-react';
import { Tomb } from '@/api/entities';
import { Artifact } from '@/api/entities';
import TodoList from '../components/tasks/TodoList';

export default function Dashboard() {
  const [stats, setStats] = useState({ tombCount: 0, artifactCount: 0 });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all tombs and artifacts to get accurate counts
        const [tombs, artifacts] = await Promise.all([
        Tomb.list('-created_date'), // Fetch all, sorted by creation date
        Artifact.list('-created_date') // Fetch all, sorted by creation date
        ]);

        // Set counts based on the total number of items fetched
        setStats({
          tombCount: tombs.length,
          artifactCount: artifacts.length
        });

        // Prepare recent items: take up to 5 of each type, then combine, sort, and slice to total 6
        const combined = [
        ...tombs.slice(0, 5).map((t) => ({
          ...t,
          type: 'Tomba',
          url: createPageUrl(`TombDetail?id=${t.id}`),
          displayName: t.name || `Tomba ${t.tomb_number}`,
          color: 'from-emerald-500 to-green-600'
        })),
        ...artifacts.slice(0, 5).map((a) => ({
          ...a,
          type: 'Reperto',
          url: createPageUrl(`ArtifactDetail?id=${a.id}`),
          displayName: `${a.shape} (US ${a.us_number})`,
          color: 'from-amber-500 to-orange-600'
        }))].
        sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6); // Get top 6 most recent overall

        setRecentItems(combined);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
            {/* Header with floating cards effect */}
            <header className="text-center relative">
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
                    <div className="relative z-10">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-emerald-800 bg-clip-text text-transparent mb-4">Necropoli di Crocifisso del Tufo

            </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Esplora la necropoli etrusca attraverso un'interfaccia digitale interattiva
                        </p>
                    </div>
                </div>
            </header>

            {/* Stats Cards with Floating Effect */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatsCard
          title="Tombe Catalogate"
          count={stats.tombCount}
          icon={Layers}
          gradient="from-emerald-500 via-green-500 to-teal-600"
          link={createPageUrl("Tombs")}
          description="Esplorare le strutture funerarie" />

                <StatsCard
          title="Reperti Studiati"
          count={stats.artifactCount}
          icon={Package}
          gradient="from-amber-500 via-orange-500 to-red-500"
          link={createPageUrl("Artifacts")}
          description="Catalogazione dei manufatti" />

                 <StatsCard
          title="Documentazione"
          count="Consulta"
          icon={FileText}
          gradient="from-purple-500 via-violet-500 to-indigo-600"
          link={createPageUrl("Documentation")}
          description="Bibliografia e relazioni di scavo" />

            </div>

            {/* Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-white/50">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                Attività Recente
                            </h2>
                            <p className="text-gray-600 mt-1">Ultimi elementi aggiunti al database</p>
                        </div>
                        <div className="p-6">
                            {loading ?
              <div className="space-y-4">
                                    {[...Array(3)].map((_, i) =>
                <div key={i} className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
                )}
                                </div> :
              recentItems.length > 0 ?
              <div className="space-y-4">
                                    {recentItems.map((item, index) => <RecentItemCard key={`${item.type}-${item.id}`} item={item} index={index} />)}
                                </div> :

              <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">Nessuna attività recente disponibile</p>
                                </div>
              }
                        </div>
                    </div>
                </div>
                
                <div>
                    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-white/50">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                                Note di Studio
                            </h2>
                        </div>
                        <div className="p-6">
                            <TodoList />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Azioni Rapide</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickAction
            title="Aggiungi Tomba"
            icon={Plus}
            link={createPageUrl("AddTomb")}
            color="from-emerald-500 to-green-600" />

                    <QuickAction
            title="Aggiungi Reperto"
            icon={Plus}
            link={createPageUrl("AddArtifact")}
            color="from-amber-500 to-orange-600" />

                    <QuickAction
            title="Nuova Documentazione"
            icon={Plus}
            link={createPageUrl("AddDocumentation")}
            color="from-purple-500 to-violet-600" />

                    <QuickAction
            title="Esplora Catalogo"
            icon={ArrowRight}
            link={createPageUrl("Tombs")}
            color="from-blue-500 to-indigo-600" />

                </div>
            </div>
        </div>);

}

const StatsCard = ({ title, count, icon: Icon, gradient, link, description }) =>
<Link to={link} className="group relative block transition-all duration-500 hover:scale-105">
        <div className={`relative bg-gradient-to-br ${gradient} rounded-3xl p-6 text-white overflow-hidden shadow-xl`}>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-4 right-4 opacity-20">
                <Icon className="w-16 h-16" />
            </div>
            <div className="relative z-10">
                <div className="mb-4">
                    <Icon className="w-8 h-8 mb-2" />
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-4xl font-bold mb-1">{count}</div>
                        <p className="text-sm text-white/80">{description}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
            </div>
        </div>
    </Link>;


const RecentItemCard = ({ item, index }) =>
<Link to={item.url} className="group block transition-all duration-300 hover:scale-[1.02]">
        <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${item.color}/5 hover:${item.color.replace('from-', 'from-').replace('to-', 'to-')}/10 border border-white/50 transition-all duration-300`}>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg`}>
                {item.type === 'Tomba' ?
      <Layers className="w-6 h-6 text-white" /> :
      <Package className="w-6 h-6 text-white" />
      }
            </div>
            <div className="flex-1">
                <p className="font-bold text-gray-800 text-lg">{item.displayName}</p>
                <p className="text-sm text-gray-600">{item.type} • {new Date(item.created_date).toLocaleDateString('it-IT')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-300" />
        </div>
    </Link>;


const QuickAction = ({ title, icon: Icon, link, color }) =>
<Link to={link} className="group block transition-all duration-300 hover:scale-105">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 text-center shadow-lg hover:shadow-xl transition-all duration-300">
            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
        </div>
    </Link>;