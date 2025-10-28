import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const createEntityAPI = (tableName, idField = 'id') => ({
  async list(orderBy = '-created_date', limit = null) {
    let query = supabase.from(tableName).select('*');

    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const field = isDesc ? orderBy.slice(1) : orderBy;
      query = query.order(field, { ascending: !isDesc });
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async get(id) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(idField, id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(tableName)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(tableName)
      .update(payload)
      .eq(idField, id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq(idField, id);

    if (error) throw error;
    return true;
  },

  schema() {
    const schemas = {
      tombs: {
        properties: {
          datazione: {
            enum: [
              "terzo quarto VII sec. a.C.",
              "ultimo quarto VII sec. a.C.",
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
            ]
          },
          tipologia_tomba: {
            enum: ["tomba a camera", "tomba a cassetta", "tomba a fossa"]
          },
          sottotipo_copertura: {
            enum: ["a doppio spiovente", "a volta", "a lastroni", "mista"]
          },
          sottotipo_banchine: {
            enum: ["tre banchine", "due banchine", "banchina unica"]
          },
          sottotipo_cassetta: {
            enum: ["in blocchi di tufo", "in lastre di tufo"]
          },
          condizione_conservazione: {
            enum: ["Ottima", "Buona", "Discreta", "Parziale", "Frammentaria"]
          }
        }
      },
      documentation: {
        properties: {
          document_type: {
            enum: [
              "Relazione di scavo",
              "Pubblicazione scientifica",
              "Foto d'archivio",
              "Disegno tecnico",
              "Nota di studio",
              "Corrispondenza",
              "Altro"
            ]
          },
          priority: {
            enum: ["Alta", "Media", "Bassa"]
          }
        }
      }
    };

    return schemas[tableName] || { properties: {} };
  }
});

export const base44 = {
  entities: {
    Tomb: createEntityAPI('tombs'),
    Artifact: createEntityAPI('artifacts'),
    Documentation: createEntityAPI('documentation'),
    StudyTask: createEntityAPI('study_tasks')
  }
};
