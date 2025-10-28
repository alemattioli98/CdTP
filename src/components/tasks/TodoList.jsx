
import React, { useState, useEffect, useCallback } from 'react';
import { StudyTask } from '@/api/entities';
import { Plus, Trash2, Check, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodoList() {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const taskList = await StudyTask.list('-created_date', 20); // Limita i risultati a 20
            setTasks(taskList);
        } catch (error) {
            console.error("Errore nel caricamento delle attività:", error);
            setError("Impossibile caricare le attività. Riprova più tardi.");
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async (e) => {
        e.preventDefault();
        const trimmedTitle = newTaskTitle.trim();
        if (trimmedTitle === "") return;

        // Optimistic UI: Add a temporary task immediately
        const optimisticTask = { id: `temp-${Date.now()}`, title: trimmedTitle, status: 'Da fare', optimistic: true };
        setTasks(prevTasks => [optimisticTask, ...prevTasks]);
        setNewTaskTitle("");

        try {
            // Send request to create the task
            await StudyTask.create({ title: trimmedTitle, status: 'Da fare' });
            // On success, refetch tasks to get the real task with its actual ID and data
            await fetchTasks(); 
        } catch (err) {
            console.error("Errore nell'aggiungere l'attività:", err);
            setError("Impossibile aggiungere l'attività. Riprova.");
            // Rollback: Remove the optimistic task if creation fails
            setTasks(prevTasks => prevTasks.filter(t => t.id !== optimisticTask.id)); 
        }
    };

    const toggleTaskStatus = async (task) => {
        // Store current tasks for rollback
        const originalTasks = tasks;
        const newStatus = task.status === 'Completato' ? 'Da fare' : 'Completato';
        
        // Optimistic UI: Update task status immediately
        setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

        try {
            await StudyTask.update(task.id, { status: newStatus });
        } catch (err) {
            console.error("Errore nell'aggiornare l'attività:", err);
            setError("Impossibile aggiornare l'attività.");
            // Rollback: Revert to original tasks if update fails
            setTasks(originalTasks); 
        }
    };

    const deleteTask = async (taskId) => {
        // Store current tasks for rollback
        const originalTasks = tasks;
        // Optimistic UI: Remove task immediately
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));

        try {
            await StudyTask.delete(taskId);
        } catch (err) {
            console.error("Errore nell'eliminare l'attività:", err);
            setError("Impossibile eliminare l'attività.");
            // Rollback: Revert to original tasks if deletion fails
            setTasks(originalTasks); 
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                <p className="text-red-500 font-medium mb-2">Errore di caricamento</p>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button 
                    onClick={fetchTasks}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                    Riprova
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <form onSubmit={addTask} className="flex gap-2">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nuova attività di studio..."
                    className="flex-grow px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm transition-all duration-300"
                />
                <button 
                    type="submit" 
                    disabled={!newTaskTitle.trim()}
                    className="px-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>
            
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <motion.div 
                            key={task.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            layout
                            className={`flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm transition-all duration-300 hover:shadow-lg group ${
                                task.status === 'Completato' ? 'opacity-60' : 'hover:scale-[1.02]'
                            } ${task.optimistic ? 'opacity-70 animate-pulse' : ''}`}
                        >
                            <div 
                                className="flex items-center gap-3 cursor-pointer flex-1" 
                                onClick={() => !task.optimistic && toggleTaskStatus(task)} // Disable click if optimistic
                            >
                                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                    task.status === 'Completato' 
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-transparent scale-110' 
                                        : 'border-gray-300 bg-white hover:border-green-400'
                                }`}>
                                    {task.status === 'Completato' && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`transition-all duration-300 font-medium ${
                                    task.status === 'Completato' 
                                        ? 'line-through text-gray-500' 
                                        : 'text-gray-800'
                                }`}>
                                    {task.title}
                                </span>
                            </div>
                            <button 
                                onClick={() => !task.optimistic && deleteTask(task.id)} // Disable click if optimistic
                                disabled={task.optimistic} // Disable button if optimistic
                                className="p-2 text-gray-400 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nessuna attività in programma</p>
                        <p className="text-sm text-gray-400 mt-1">Aggiungi una nuova attività per iniziare</p>
                    </div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
}
