// src/config/api.js
export const API_BASE_URL = 'http://10.11.185.214:3334';

export const ENDPOINTS = {
  PROFESSIONALS: '/professionals',
  PROFESSIONAL_ID: (id:string) => `/professional/${id}`, 
  GOAL: '/goal',
  GOAL_USER: (personId: string) => `/goals/${personId}`,
  GOAL_USER_DELETE: (goalId: string, personId: string, ) => `/goal/${goalId}/${personId}`,
  GOAL_USER_EXECUTE:(goalId: string, personId: string )=> `/goal/execute/${goalId}/${personId}`,
  GOAL_USER_UPDATE: (goalId: string, personId: string) => `/goal/update/${goalId}/${personId}`,
  USER:'/user'
};