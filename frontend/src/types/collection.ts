export interface CollectedPlant {
  id: number;
  user: number;
  user_name?: string;
  user_email?: string;
  image: string;
  image_url: string;
  common_name: string;
  scientific_name: string;
  family: string;
  category: 'Interior' | 'Exterior' | 'Suculenta' | 'Cactus' | 'Flor' | 'Árbol' | 'Medicinal' | 'Huerto' | 'General' | string;
  origin: string;
  description: string;
  light_requirement: string;
  watering_frequency: string;
  temperature_range: string;
  humidity_requirement: string;
  difficulty: 'Fácil' | 'Moderado' | 'Difícil' | string;
  toxicity_pets: boolean;
  toxicity_humans: boolean;
  toxicity_details: string;
  fun_facts: string;
  confidence: number;
  user_notes?: string | null;
  location_found?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlantAnalysisResult {
  is_plant: boolean;
  common_name: string;
  scientific_name: string;
  family: string;
  category: string;
  origin: string;
  description: string;
  light_requirement: string;
  watering_frequency: string;
  temperature_range: string;
  humidity_requirement: string;
  difficulty: string;
  toxicity_pets: boolean;
  toxicity_humans: boolean;
  toxicity_details: string;
  fun_facts: string;
  confidence: number;
}

export interface CollectionStats {
  total_plants: number;
  distinct_families: number;
  toxic_pets_count: number;
  toxic_humans_count: number;
  category_breakdown: Array<{ category: string; count: number }>;
  difficulty_breakdown: Array<{ difficulty: string; count: number }>;
}
