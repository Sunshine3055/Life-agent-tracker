export type Role = 'SMD Base' | 'Life Agent';

export type CaseType = 'Life Policy' | 'Annuity Policy';

export type Status = 'Inforce' | 'Pending' | 'Awaiting Response' | 'Escalated' | 'Closed';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type FollowUpMethod = 'Call' | 'Email' | 'WeChat' | 'Telegram';

export interface FollowUpLogEntry {
  id: string;
  date: string;
  contactName: string;
  method: FollowUpMethod;
  outcome: string;
  nextStep: string;
  timestamp: string;
}

export interface Case {
  id: string; // Case ID / Link to carrier life book
  clientName: string;
  role: Role;
  caseType: CaseType;
  subCategory: string;
  status: Status;
  priority: Priority;
  caseManager: string;
  submissionDate: string;
  nextFollowUpDate: string;
  notes: string; // Timestamped entries appended
  followUpLog: FollowUpLogEntry[];
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const SMD_BASE_SUBCATEGORIES = [
  'Agent Onboarding',
  'Licensing',
  'CE Requirement',
  'Carrier Issue',
  'Policy Problem',
  'Webinar Coordination',
  'Other'
];

export const LIFE_AGENT_SUBCATEGORIES = [
  'New Application',
  'Underwriting',
  'Policy Delivery',
  'Client Follow-Up',
  'Claim',
  'Referral',
  'Other'
];

export const CASE_MANAGERS = [
  'Sarah Jenkins (s.jenkins@outlook.com)',
  'Michael Chen (m.chen@outlook.com)',
  'Emma Wilson (e.wilson@outlook.com)',
  'David Miller (d.miller@outlook.com)'
];

export const STATUS_COLORS: Record<Status, string> = {
  'Inforce': 'bg-blue-500',
  'Pending': 'bg-amber-500',
  'Awaiting Response': 'bg-purple-500',
  'Escalated': 'bg-red-500',
  'Closed': 'bg-gray-500'
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Low': 'text-gray-500',
  'Medium': 'text-blue-500',
  'High': 'text-amber-500',
  'Urgent': 'text-red-500'
};

export const ASSISTANT_EMAIL = 'assistant@Karmafinancials.com';
