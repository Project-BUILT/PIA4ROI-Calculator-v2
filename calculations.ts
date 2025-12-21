import { CalculatorInputs, CalculationResult, RiskMode, LocationProfile, AgencyType, SensitivityResult } from "../types";
import { MULTIPLIERS, DEFAULTS } from "../constants";

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    notation: 'standard'
  }).format(amount);
};

export const getDefaultLiability = (profile: LocationProfile, agency: AgencyType): number => {
  if (profile === LocationProfile.RURAL) return 500;
  if (agency === AgencyType.POLICE) {
    return profile === LocationProfile.MAJOR_CITY ? 8000 : 650;
  }
  return 500;
};

// New Helper: Calculate Pilot Stats based on headcount
export const calculatePilotStats = (headcount: number) => {
  // Rule: 1 Room per 100 people. Minimum 1 room.
  const numRooms = Math.max(1, Math.ceil(headcount / 100));
  
  // Costs: $50k per room setup. $1k/mo ($12k/yr) per room service.
  const pilotCapex = numRooms * 50000;
  const pilotOpexAnnual = numRooms * 1000 * 12;
  
  return { numRooms, pilotCapex, pilotOpexAnnual };
};

// Internal helper for single-pass calculation
const calculateScenario = (inputs: CalculatorInputs, mode: RiskMode, pilotCosts: {capex: number, opex: number}): number => {
  const {
    headcount,
    annualOvertimeSpend,
    turnoverRatePct,
    annualTurnoverCount,
    avgFullyLoadedCost,
    annualWorkersComp,
    liabilityCostPerHead,
    includePerformanceDrag
  } = inputs;

  const modeKey = mode.toUpperCase() as keyof typeof MULTIPLIERS.OVERTIME_SAVINGS;
  const salary = avgFullyLoadedCost || DEFAULTS.AVG_FULLY_LOADED;
  const payroll = headcount * salary;

  // 1. Turnover
  const effectiveCount = turnoverRatePct 
    ? Math.round(headcount * (turnoverRatePct / 100))
    : (annualTurnoverCount || Math.round(headcount * (DEFAULTS.TURNOVER_RATE / 100)));
    
  const replacementCost = inputs.recruitCost && inputs.recruitCost > 20000 ? inputs.recruitCost : DEFAULTS.REPLACEMENT_COST;
  const turnoverDrag = effectiveCount * replacementCost;

  // 2. Overtime
  const estimatedOtSpend = payroll * 0.12;
  const otSpend = annualOvertimeSpend > 0 ? annualOvertimeSpend : estimatedOtSpend;
  const overtimeDrag = otSpend * MULTIPLIERS.OVERTIME_SAVINGS[modeKey];

  // 3. Workers Comp
  const estimatedWcSpend = payroll * 0.03;
  const compSpend = annualWorkersComp > 0 ? annualWorkersComp : estimatedWcSpend;
  const workersCompDrag = compSpend * MULTIPLIERS.COMP_REDUCTION[modeKey];

  // 4. Liability
  const liabilityDrag = headcount * liabilityCostPerHead;

  // 5. Performance / Absenteeism
  const hasRealData = annualOvertimeSpend > 0 || annualWorkersComp > 0;
  const shouldIncludePerf = includePerformanceDrag !== undefined ? includePerformanceDrag : !hasRealData;
  const performanceDrag = shouldIncludePerf ? (payroll * MULTIPLIERS.PRODUCTIVITY_LOSS[modeKey]) : 0;

  return turnoverDrag + overtimeDrag + workersCompDrag + liabilityDrag + performanceDrag;
};

export const calculateROI = (inputs: CalculatorInputs, activeMode: RiskMode): CalculationResult => {
  const {
    headcount,
    turnoverRatePct,
    annualTurnoverCount,
    annualOvertimeSpend,
    annualWorkersComp,
    liabilityCostPerHead,
    includePerformanceDrag,
    avgFullyLoadedCost
  } = inputs;

  // Base Calculation for Active Mode
  const modeKey = activeMode.toUpperCase() as keyof typeof MULTIPLIERS.OVERTIME_SAVINGS;
  const salary = avgFullyLoadedCost || DEFAULTS.AVG_FULLY_LOADED;
  const payroll = headcount * salary;

  // Turnover Detail
  const effectiveCount = turnoverRatePct 
    ? Math.round(headcount * (turnoverRatePct / 100))
    : (annualTurnoverCount || Math.round(headcount * (DEFAULTS.TURNOVER_RATE / 100)));
  const replacementCost = inputs.recruitCost && inputs.recruitCost > 20000 ? inputs.recruitCost : DEFAULTS.REPLACEMENT_COST;
  const turnoverDrag = effectiveCount * replacementCost;

  // OT Detail
  const otSpend = annualOvertimeSpend > 0 ? annualOvertimeSpend : (payroll * 0.12);
  const overtimeDrag = otSpend * MULTIPLIERS.OVERTIME_SAVINGS[modeKey];

  // WC Detail
  const compSpend = annualWorkersComp > 0 ? annualWorkersComp : (payroll * 0.03);
  const workersCompDrag = compSpend * MULTIPLIERS.COMP_REDUCTION[modeKey];

  // Liability Detail
  const liabilityDrag = headcount * liabilityCostPerHead;

  // Performance Detail
  const hasRealData = annualOvertimeSpend > 0 || annualWorkersComp > 0;
  const shouldIncludePerf = includePerformanceDrag !== undefined ? includePerformanceDrag : !hasRealData;
  const performanceDrag = shouldIncludePerf ? (payroll * MULTIPLIERS.PRODUCTIVITY_LOSS[modeKey]) : 0;

  const totalAvoidableLoss = turnoverDrag + overtimeDrag + workersCompDrag + liabilityDrag + performanceDrag;

  // --- Financials (Dynamic) ---
  // If user provided overrides in inputs (Deep Dive), use them. 
  // Otherwise calculate based on headcount logic.
  const dynamicStats = calculatePilotStats(headcount);
  
  const pilotCapex = inputs.pilotCapex || dynamicStats.pilotCapex;
  const pilotOpexAnnual = inputs.pilotOpexAnnual || dynamicStats.pilotOpexAnnual;
  // If inputs.pilotCapex exists, we estimate numRooms from it, otherwise we use the calculated one.
  // Reverse logic: 50k per room.
  const numRooms = inputs.pilotCapex ? Math.max(1, Math.round(inputs.pilotCapex / 50000)) : dynamicStats.numRooms;

  const pilotCost = pilotCapex + pilotOpexAnnual; 
  
  // Net Benefit (Annual)
  const netBenefit = totalAvoidableLoss - pilotOpexAnnual;
  
  // Payback (Months) = Capex / (Monthly Net Benefit)
  let paybackMonths = "N/A";
  if (netBenefit > 0) {
    const monthlyBenefit = netBenefit / 12;
    const months = pilotCapex / monthlyBenefit;
    paybackMonths = months.toFixed(1);
  }

  // Break Even (Days)
  let breakEvenDays = "N/A";
  if (netBenefit > 0) {
    const dailyBenefit = netBenefit / 365;
    const days = pilotCapex / dailyBenefit;
    breakEvenDays = Math.ceil(days).toString();
  }

  // --- Sensitivity Analysis ---
  const buildSensitivity = (m: RiskMode): SensitivityResult => {
    const total = calculateScenario(inputs, m, { capex: pilotCapex, opex: pilotOpexAnnual });
    const net = total - pilotOpexAnnual;
    let pb = "N/A";
    if (net > 0) pb = (pilotCapex / (net / 12)).toFixed(1);
    const roi = (net / (pilotCapex + pilotOpexAnnual)) * 100; // Simplified 1-year ROI %
    
    return {
      mode: m,
      totalAnnualLoss: total,
      netBenefit: net,
      paybackMonths: pb,
      roiMultiplier: roi
    };
  };

  const sensitivity = {
    conservative: buildSensitivity(RiskMode.CONSERVATIVE),
    standard: buildSensitivity(RiskMode.STANDARD),
    aggressive: buildSensitivity(RiskMode.AGGRESSIVE)
  };

  // Identify Driver
  const costs = {
    "Turnover": turnoverDrag,
    "Overtime": overtimeDrag,
    "Liability": liabilityDrag,
    "Workers Comp": workersCompDrag,
    "Performance": performanceDrag
  };
  const primaryDriver = Object.entries(costs).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return {
    turnoverDrag,
    overtimeDrag,
    workersCompDrag,
    liabilityDrag,
    performanceDrag,
    totalAvoidableLoss,
    pilotCost,
    netBenefit,
    paybackMonths,
    breakEvenDays,
    numRooms,
    sensitivity,
    primaryDriver
  };
};