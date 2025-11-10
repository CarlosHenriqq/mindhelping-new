// src/config/api.js
export const API_BASE_URL = 'https://mind-helping-api.fly.dev';

export const ENDPOINTS = {
  PROFESSIONALS: '/professionals',
  PROFESSIONAL_ID: (id:string) => `/professional/${id}`, 
  GOAL: '/goal',
  GOAL_USER: (personId: string) => `/goals/${personId}`,
  GOAL_USER_DELETE: (goalId: string, personId: string, ) => `/goal/${goalId}/${personId}`,
  GOAL_USER_EXECUTE:(goalId: string, personId: string )=> `/goal/execute/${goalId}/${personId}`,
  GOAL_USER_UPDATE: (goalId: string, personId: string) => `/goal/update/${goalId}/${personId}`,
  GOAL_USER_COUNTER: (goalId: string, personId: string) => `/goal/counter/${goalId}/${personId}`,
  SCHEDULES_GET: (professionalId: string) => `/schedules/${professionalId}`,
  HOUR_GET: (scheduleId:string) => `/hourlies/${scheduleId}`,
  SCHEDULING: '/schedulings',
  SCHEDULING_USER:(userId:string) =>`/schedulings/${userId}`,
  USER: (userId:string) => `/users/${userId}`,
  REGISTER:'/users',
  USER_DETAILS: (userId: string) => `/me/${userId}`,
  USER_UPDATE: (userId: string) => `/users/data-for-update/${userId}`,
  FEELINGS_USER:(userId:string) => `/feelings/${userId}`,
  CVV_CALLS: (userId: string) => `/cvv-calls/${userId}`,
  DAILY: (userId: string) =>`/dailys/${userId}`,
  RECOVER_PASSWORD: '/persons/forgot-password',
  VERIFY_CODE:'/persons/verify-reset-password-code', 
  RESET_PASSWORD:'/users/password' ,
  DELETE_USER:(personId:string) =>`/persons/${personId}`,
  CANCEL_SCHEDULING:(hourlyId:string, schedulingId:string)=>`/hourlies/${hourlyId}/${schedulingId}`,
  LOGIN: '/persons/authenticate'
};