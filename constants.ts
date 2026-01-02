
import { ClientStatus, Division, Role, TaskPriority } from "./types";

export const CLIENT_STATUSES = Object.values(ClientStatus);
export const DIVISIONS = Object.values(Division);
export const ROLES: Role[] = ["Manager", "Leader", "Sales", "Support", "Trainer", "IT", "Developer", "QA"];

export const PACKAGES = [
  "Basic Lite", 
  "Basic Business", 
  "Basic Enterprise", 
  "Smart Lite", 
  "Smart Business", 
  "Smart Enterprise"
];

export const STATUS_COLORS: Record<ClientStatus, string> = {
  [ClientStatus.Onboarding]: "bg-blue-100 text-blue-700",
  [ClientStatus.WaitingForData]: "bg-yellow-100 text-yellow-700",
  [ClientStatus.Training1]: "bg-indigo-100 text-indigo-700",
  [ClientStatus.WaitingForFeedback1]: "bg-orange-100 text-orange-700",
  [ClientStatus.Training2]: "bg-indigo-100 text-indigo-700",
  [ClientStatus.WaitingForFeedback2]: "bg-orange-100 text-orange-700",
  [ClientStatus.Training3]: "bg-indigo-100 text-indigo-700",
  [ClientStatus.Integration]: "bg-purple-100 text-purple-700",
  [ClientStatus.Active]: "bg-green-100 text-green-700",
  [ClientStatus.Drop]: "bg-red-100 text-red-700",
};

export const DIVISION_COLORS: Record<Division, string> = {
  [Division.Sales]: "bg-emerald-50 border-emerald-200",
  [Division.Support]: "bg-cyan-50 border-cyan-200",
  [Division.Trainer]: "bg-amber-50 border-amber-200",
  [Division.IT]: "bg-violet-50 border-violet-200",
  [Division.QC]: "bg-rose-50 border-rose-200",
};

// Sequential Workflow Definition
export const WORKFLOW_SEQUENCE: {
  stage: ClientStatus;
  taskTitle: string;
  division: Division;
  daysToComplete: number;
  priority: TaskPriority;
  defaultSubtasks?: string[]; // Added default subtasks support
}[] = [
  { 
    stage: ClientStatus.WaitingForData, 
    taskTitle: "Waiting for Data", 
    division: Division.Support, 
    daysToComplete: 3, 
    priority: 'High', // Changed from 'Urgent' to 'High'
    defaultSubtasks: [
      "Greeting",
      "Group koordinasi",
      "Akun WhatsApp",
      "Akun Business Manager",
      "Dokumen requirement"
    ]
  },
  { 
    stage: ClientStatus.Onboarding, 
    taskTitle: "Onboarding Process", 
    division: Division.Sales, 
    daysToComplete: 2, 
    priority: 'High',
    defaultSubtasks: [
      "Konfirmasi kelengkapan data",
      "Konfirmasi bisnis manager",
      "Konfirmasi requirement",
      "Penjelasan SoW"
    ]
  },
  { stage: ClientStatus.Training1, taskTitle: "Training #1 (Requirements)", division: Division.Trainer, daysToComplete: 5, priority: 'High' },
  { stage: ClientStatus.WaitingForFeedback1, taskTitle: "Collect Feedback #1", division: Division.Support, daysToComplete: 3, priority: 'Regular' },
  { stage: ClientStatus.Training2, taskTitle: "Training #2 (Refinement)", division: Division.Trainer, daysToComplete: 4, priority: 'High' },
  { stage: ClientStatus.WaitingForFeedback2, taskTitle: "Collect Feedback #2", division: Division.Support, daysToComplete: 3, priority: 'Regular' },
  { stage: ClientStatus.Training3, taskTitle: "Training #3 (Finalization)", division: Division.Trainer, daysToComplete: 3, priority: 'High' },
  { 
    stage: ClientStatus.Integration, 
    taskTitle: "System Integration & Setup", 
    division: Division.IT, 
    daysToComplete: 5, 
    priority: 'Urgent',
    defaultSubtasks: [
      "Integrasi WhatsApp",
      "Integrasi Messenger",
      "Integrasi Instagram",
      "Integrasi Livechat",
      "Penjelasan dashboard"
    ]
  },
];
