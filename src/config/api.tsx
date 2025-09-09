// src/config/api.js
export const API_BASE_URL = 'http://10.11.185.214:3333';

export const ENDPOINTS = {
  PROFESSIONALS: '/professionals',
  PROFESSIONAL_ID: (id:string) => `/professional/${id}`, 
};