export type Activity = {
  id: string;
  title: string | null;
  type: 'run' | 'ride';
  distance_km: number | null;
  duration_min: number | null;
  created_at: string;
  notes?: string;
};

export // --- TYPE for form data ---
  type ActivityFormData = {
    type: 'run' | 'ride' | '';
    title: string;
    distance_km: string;
    duration_min: string;
    notes: string;
  };

export type FormDataError = {
  type: string;
  title: string;
  distance_km: string;
  duration_min: string;
  notes: string;
};

export type ActionResult = {
  ok: boolean;
  message?: string | null;
  user?: Profile;
};

export type UpdateProfileResult = ActionResult;

export type LogoutResult = ActionResult;

export type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
};

export type DashboardActivity = {
  id: string;
  type: 'run' | 'ride';
  distance_km: number;
  duration_min: number;
  notes: string;
  title: string;
  created_at: Date;
};

export type DashboardWeeklyReport = {
  totalRun: number;
  totalTime: number;
  topSport: number;
};

export type Dashboard = {
  ok: boolean;
  recent: DashboardActivity[];
  summary: DashboardWeeklyReport;
};

export type SignInResult = ActionResult;

export type UserProfileData = {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  allTimeStats: {
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
    avgSpeed: number;
  };
};

export type ProfileRes = {
  ok: boolean;
  message?: string | null;
  profile?: UserProfileData | null
};

export type PaginationProps = {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export type WeeklyReportData = {
  reportId: string;
  dateRange: { start: string; end: string; };
  summaryMetrics: {
    totalDistance: number; totalActivities: number; avgDistance: number;
    avgSpeed: number; avgDuration: number; longestDistance: number; longestDuration: number;
  };
  goalProgress: { current: number; goal: number; };
  weeklyActivities: {
    id: string; title: string; type: 'run' | 'ride'; date: string;
    distance: number; duration: number; speed: number;
  }[];
  insights: { mostActiveDay: string; fastestActivity: string; consistency: string; };
  comparisonToLastWeek: {
    distanceChangePercent: number; activitiesChangeCount: number;
    avgSpeedChange: number; avgDurationChange: number;
  };
};

export type SuggestionResponse = {
  suggestion: string;
  rationale: string;
  inputs: {
    totals: { distance: number; duration: number; activities: number };
    averages: { distance: number; duration: number };
  };
};