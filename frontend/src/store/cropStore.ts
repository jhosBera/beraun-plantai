import { create } from 'zustand';
import { Plot, Crop } from '../types';
import { apiClient } from '../api/client';

interface CropState {
  plots: Plot[];
  crops: Crop[];
  selectedCrop: Crop | null;
  isLoading: boolean;
  fetchPlots: () => Promise<void>;
  fetchCrops: (plotId?: number) => Promise<void>;
  fetchCropDetail: (id: number) => Promise<void>;
  createPlot: (data: Partial<Plot>) => Promise<Plot>;
  createCrop: (data: FormData | Partial<Crop>) => Promise<Crop>;
  updateCrop: (id: number, data: Partial<Crop>) => Promise<Crop>;
  deleteCrop: (id: number) => Promise<void>;
}

export const useCropStore = create<CropState>((set, get) => ({
  plots: [],
  crops: [],
  selectedCrop: null,
  isLoading: false,

  fetchPlots: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/plots/');
      set({ plots: res.data.results || res.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching plots:', error);
    }
  },

  fetchCrops: async (plotId) => {
    set({ isLoading: true });
    try {
      const url = plotId ? `/crops/?plot=${plotId}` : '/crops/';
      const res = await apiClient.get(url);
      set({ crops: res.data.results || res.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching crops:', error);
    }
  },

  fetchCropDetail: async (id) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get(`/crops/${id}/`);
      set({ selectedCrop: res.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error('Error fetching crop detail:', error);
    }
  },

  createPlot: async (data) => {
    const res = await apiClient.post('/plots/', data);
    await get().fetchPlots();
    return res.data;
  },

  createCrop: async (data) => {
    const isFormData = data instanceof FormData;
    const res = await apiClient.post('/crops/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    await get().fetchCrops();
    await get().fetchPlots();
    return res.data;
  },

  updateCrop: async (id, data) => {
    const res = await apiClient.patch(`/crops/${id}/`, data);
    await get().fetchCropDetail(id);
    await get().fetchCrops();
    return res.data;
  },

  deleteCrop: async (id) => {
    await apiClient.delete(`/crops/${id}/`);
    await get().fetchCrops();
    await get().fetchPlots();
  }
}));
