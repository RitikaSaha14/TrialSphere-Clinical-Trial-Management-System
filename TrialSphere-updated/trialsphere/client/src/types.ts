export type StudyStatus = 'Recruiting' | 'Active' | 'Planning' | 'Completed' | 'On Hold'
export interface Study { id: string; protocolCode: string; title: string; phase: string; status: StudyStatus; targetEnrollment: number; currentEnrollment: number; startDate: string; }
export interface Site { id: string; name: string; city: string; country: string; status: string; studyCount: number; }
export interface Participant { id: string; participantCode: string; studyTitle: string; siteName: string; status: string; enrolledAt: string; }
export interface DashboardStats { activeStudies: number; activeSites: number; enrolledParticipants: number; enrollmentTarget: number; trend: { month: string; enrolled: number; target: number }[]; statusBreakdown: { name: string; value: number }[]; }
