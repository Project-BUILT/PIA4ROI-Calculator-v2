import { AgencyType, LocationProfile, CalculatorInputs } from "./types";

export const DEFAULTS = {
  REPLACEMENT_COST: 150000,
  AVG_FULLY_LOADED: 120000,
  SICK_HOURS: 80,
  RECRUIT_COST: 15000,
  TRAINING_COST: 5000,
  VACANCY_DAYS: 90,
  DISABILITY_RATE: 2.5,
  // Pilot Defaults
  PILOT_CAPEX: 50000, // Hardware, Install, Launch
  PILOT_OPEX: 12000,  // Annual Support
  TURNOVER_RATE: 10,  // 10% default
};

export const MULTIPLIERS = {
  OVERTIME_SAVINGS: { CONSERVATIVE: 0.05, STANDARD: 0.10, AGGRESSIVE: 0.15 },
  COMP_REDUCTION: { CONSERVATIVE: 0.03, STANDARD: 0.06, AGGRESSIVE: 0.10 },
  PRODUCTIVITY_LOSS: { CONSERVATIVE: 0.01, STANDARD: 0.02, AGGRESSIVE: 0.03 },
};

export const MOCK_INPUTS: CalculatorInputs = {
  agencyType: AgencyType.POLICE,
  headcount: 342,
  locationProfile: LocationProfile.SUBURB,
  annualOvertimeSpend: 2400000,
  annualTurnoverCount: 34,
  turnoverRatePct: 10,
  avgFullyLoadedCost: 135000,
  annualWorkersComp: 450000,
  avgSickHours: 96,
  recruitCost: 18000, // Used as general replacement cost proxy in UI logic often
  vacancyDays: 110,
  trainingCost: 7500,
  disabilityRate: 3.2,
  liabilityCostPerHead: 850,
  pilotCapex: 45000,
  pilotOpexAnnual: 12000,
  pilotDurationDays: 90,
  includePerformanceDrag: false,
  isMockData: true,
  profile: {
    departmentName: "Chandler Police Department (DEMO)",
    city: "Glendale",
    state: "AZ",
    county: "Maricopa",
    contactName: "Chief Demonstration",
    contactTitle: "Chief of Police",
    decisionTimeline: "30-90 days",
    biggestPressure: "Overtime"
  }
};

export const PRESETS = [
  {
    name: "Chicago PD Style",
    description: "Major City / 11,700+ Sworn",
    data: {
      agencyType: AgencyType.POLICE,
      headcount: 11720,
      locationProfile: LocationProfile.MAJOR_CITY,
      liabilityCostPerHead: 8000
    }
  },
  {
    name: "Glendale PD Style",
    description: "Suburb / ~350 Sworn",
    data: {
      agencyType: AgencyType.POLICE,
      headcount: 348,
      locationProfile: LocationProfile.SUBURB,
      liabilityCostPerHead: 650
    }
  },
  {
    name: "Rural (Avg Town)",
    description: "Rural / Pop ~5,000",
    data: {
      agencyType: AgencyType.MIXED,
      headcount: 35, // Will be recalculated by UI logic, but safe default
      locationProfile: LocationProfile.RURAL,
      liabilityCostPerHead: 500,
      population: 5000,
      ruralSubtype: 'Mixed'
    }
  }
];

export const EVIDENCE = [
  {
    id: "sleep-1",
    category: "Sleep & Performance",
    title: "Impact of Sleep Deprivation on Decision Making",
    source: "Journal of Safety Research",
    url: "https://pubmed.ncbi.nlm.nih.gov/sleep-deprivation-safety"
  },
  {
    id: "ptsd-1",
    category: "PTSD & Turnover",
    title: "Occupational Stress in First Responders",
    source: "NIST Public Safety Research",
    url: "https://www.nist.gov/public-safety-research"
  },
  {
    id: "liability-1",
    category: "Liability",
    title: "Chicago Police Misconduct Payouts 2023",
    source: "City of Chicago Data Portal",
    url: "https://data.cityofchicago.org"
  },
  {
    id: "rural-1",
    category: "Rural Staffing",
    title: "Local Police Departments Personnel, 2020",
    source: "Bureau of Justice Statistics",
    url: "https://bjs.ojp.gov/media/68016/download"
  },
  {
    id: "rural-2",
    category: "Rural Staffing",
    title: "US Fire Department Profile 2020 (Tables 4 & 21)",
    source: "NFPA",
    url: "https://content.nfpa.org/-/media/Project/Storefront/Catalog/Files/Research/NFPA-Research/Emergency-responders/osFDProfileTables.pdf"
  },
  {
    id: "rural-3",
    category: "Rural EMS",
    title: "Rural Volunteer EMS: Reports from the Field",
    source: "UNC Sheps Center",
    url: "https://www.shepscenter.unc.edu/wp-content/uploads/2014/10/FR99.pdf"
  },
  {
    id: "rural-4",
    category: "Rural EMS",
    title: "Rural EMS Priorities 2024",
    source: "National Rural Health Association",
    url: "https://www.ruralhealth.us/nationalruralhealth/media/documents/advocacy/advocacy%20leave-behinds%202024/rural-ems-priorities_1.pdf"
  }
];
