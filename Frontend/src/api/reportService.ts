import { apiClient } from './axios';

export interface ReportPublic {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PaginatedReports {
  total: number;
  page: number;
  page_size: number;
  results: ReportPublic[];
}

export interface ReportDetail extends ReportPublic {
  author: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }
}

export const getReportById = async (id: string): Promise<ReportDetail> => {
  const response = await apiClient.get<ReportDetail>(`/reports/${id}`);
  return response.data;
};

export const getReports = async (page: number = 1, pageSize: number = 20, status?: string): Promise<PaginatedReports> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  
  if (status) {
    params.append('status', status);
  }

  const response = await apiClient.get<PaginatedReports>('/reports', {
    params
  });
  
  return response.data;
};

export interface ReportCreate {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string | null;
}

export const createReport = async (data: ReportCreate): Promise<ReportPublic> => {
  const response = await apiClient.post<ReportPublic>('/reports', data);
  return response.data;
};

export const updateReportStatus = async (id: string, status: string): Promise<ReportPublic> => {
  const response = await apiClient.put<ReportPublic>(`/reports/${id}/status`, { status });
  return response.data;
};
