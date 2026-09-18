export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  farm_name: string;
  avatar?: string | null;
  notification_preferences: {
    email_alerts: boolean;
    in_app_alerts: boolean;
    watering_reminders: boolean;
    disease_warnings: boolean;
    daily_summary: boolean;
  };
  created_at: string;
}

export interface Plot {
  id: number;
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  area_hectares: number;
  soil_type: string;
  notes?: string;
  crops_count?: number;
  crops?: Crop[];
  created_at: string;
}

export interface Crop {
  id: number;
  plot: number;
  plot_name?: string;
  name: string;
  species: string;
  variety: string;
  planting_date: string;
  estimated_harvest_date?: string | null;
  status: 'growing' | 'healthy' | 'alert' | 'harvesting' | 'harvested' | 'archived';
  status_display?: string;
  image?: string | null;
  water_requirement: string;
  sunlight_requirement: string;
  notes?: string;
  care_events_count?: number;
  diagnoses_count?: number;
  care_events?: CareEvent[];
  status_logs?: StatusLog[];
  created_at: string;
}

export interface CareEvent {
  id: number;
  crop: number;
  event_type: 'watering' | 'fertilization' | 'pruning' | 'fumigation' | 'harvest' | 'monitoring' | 'other';
  event_type_display?: string;
  title: string;
  event_date: string;
  product_used?: string;
  amount?: string;
  notes?: string;
  created_at: string;
}

export interface StatusLog {
  id: number;
  crop: number;
  status: 'healthy' | 'good' | 'warning' | 'critical' | 'recovered';
  status_display?: string;
  title: string;
  observations: string;
  photo?: string | null;
  logged_at: string;
  created_at: string;
}

export interface DiagnosisPrediction {
  id: number;
  common_name: string;
  scientific_name: string;
  crop: string;
  is_healthy: boolean;
  severity: string;
  confidence: number;
  symptoms: string;
  recommended_action: string;
}

export interface Diagnosis {
  id: number;
  crop?: number | null;
  crop_name?: string;
  crop_species?: string;
  plot_name?: string;
  image: string;
  disease_common_name: string;
  disease_scientific_name: string;
  confidence: number;
  severity: string;
  is_healthy: boolean;
  symptoms: string;
  treatment_plan: string;
  top_predictions: DiagnosisPrediction[];
  user_feedback: 'confirmed' | 'doubtful' | 'rejected' | 'pending';
  diagnosed_at: string;
}

export interface ChatMessage {
  id: number;
  session: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  suggested_actions?: Record<string, any>;
  sent_at: string;
}

export interface ChatSession {
  id: number;
  crop?: number | null;
  crop_name?: string;
  diagnosis?: number | null;
  diagnosis_disease?: string;
  title: string;
  messages_count?: number;
  messages?: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  crop: number;
  crop_name?: string;
  crop_species?: string;
  alert_type: 'watering' | 'fertilization' | 'disease_check' | 'pruning' | 'fumigation' | 'custom';
  alert_type_display?: string;
  title: string;
  description: string;
  scheduled_for: string;
  recurrence_days: number;
  is_active: boolean;
  is_sent: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  alert?: number | null;
  title: string;
  message: string;
  notification_type: 'reminder' | 'warning' | 'info' | 'success';
  notification_type_display?: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export * from './collection';
