export enum AgencyType {
  POLICE = 'Police',
  FIRE = 'Fire',
  EMS = 'EMS',
  MIXED = 'Mixed'
}

export enum LocationProfile {
  MAJOR_CITY = 'Major City',
  SUBURB = 'Suburb',
  RURAL = 'Rural'
}

export enum RiskMode {
  CONSERVATIVE = 'Conservative',
  STANDARD = 'Standard',
  AGGRESSIVE = 'Aggressive'
}

export interface AgencyProfile {
  departmentName: string;
  city: string;
  state: string; // 2 letter code
  county?: string;
  contactName: string;
  contactTitle: string;
  contactPhone?: string;
  decisionTimeline: '0-30 days' | '30-90 days' | '90+ days' | 'Unknown';
  biggestPressure: 'Overtime' | 'Turnover' | 'Liability' | 'Cancer/Exposure' | 'Sleep/Readiness' | 'Other';
}

export interface CalculatorInputs {
  // Required Quick Calc
  agencyType: AgencyType;
  headcount: number;
  locationProfile: LocationProfile;
  
  // Optional / Deep Dive Stats
  annualOvertimeSpend: number;
  annualTurnoverCount: number; // Legacy count, now derived from rate preferably
  turnoverRatePct?: number; // New: Primary driver for turnover
  avgFullyLoadedCost: number;
  annualWorkersComp: number;
  avgSickHours: number;
  
  // Advanced / Deep Dive Modeling
  recruitCost: number; // Replacement cost
  vacancyDays: number;
  trainingCost: number;
  disabilityRate: number; // Percentage 0-100
  
  // Pilot / Implementation Costs
  pilotCapex?: number;
  pilotOpexAnnual?: number;
  pilotDurationDays?: number;

  // Toggles
  includePerformanceDrag?: boolean;
  
  // Custom Overrides
  liabilityCostPerHead: number; // The slider value

  // Rural Scenario specific
  population?: number;
  ruralSubtype?: 'Police' | 'Fire' | 'EMS' | 'Mixed';

  // Stage 2: Profile Data (Optional initially, required for full report)
  profile?: AgencyProfile;
  
  // System flags
  isMockData?: boolean;
}

export interface SensitivityResult {
  mode: RiskMode;
  totalAnnualLoss: number;
  netBenefit: number;
  paybackMonths: string;
  roiMultiplier: number;
}

export interface CalculationResult {
  turnoverDrag: number;
  overtimeDrag: number;
  workersCompDrag: number;
  liabilityDrag: number;
  performanceDrag: number;
  totalAvoidableLoss: number;
  
  // New Financials
  pilotCost: number;
  netBenefit: number;
  paybackMonths: string;
  breakEvenDays: string;
  numRooms: number; // Track calculated room count
  
  sensitivity: {
    conservative: SensitivityResult;
    standard: SensitivityResult;
    aggressive: SensitivityResult;
  };
  
  primaryDriver: string;
}

export interface LeadData {
  stage: 'unlocked_results' | 'full_report_submitted';
  email: string;
  agencyType: string;
  headcount: number;
  timestamp: string;
  consent: boolean;
  profile?: AgencyProfile;
}