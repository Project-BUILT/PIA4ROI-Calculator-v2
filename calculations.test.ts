import { describe, it, expect } from 'vitest';
import { calculateROI } from './utils/calculations';
import { CalculatorInputs, AgencyType, LocationProfile, RiskMode } from './types';
import { MULTIPLIERS, DEFAULTS } from './constants';

const mockInputs: CalculatorInputs = {
  agencyType: AgencyType.POLICE,
  headcount: 100,
  locationProfile: LocationProfile.SUBURB,
  annualOvertimeSpend: 100000,
  annualTurnoverCount: 2,
  avgFullyLoadedCost: 100000,
  annualWorkersComp: 50000,
  avgSickHours: 80,
  recruitCost: 10000,
  vacancyDays: 30,
  trainingCost: 1000,
  disabilityRate: 1,
  liabilityCostPerHead: 500 // Slider value
};

describe('calculateROI', () => {
  it('calculates turnover drag correctly', () => {
    const result = calculateROI(mockInputs, RiskMode.STANDARD);
    // 2 people * 150k default
    expect(result.turnoverDrag).toBe(300000);
  });

  it('calculates liability drag based on slider', () => {
    const result = calculateROI(mockInputs, RiskMode.STANDARD);
    // 100 heads * 500
    expect(result.liabilityDrag).toBe(50000);
  });

  it('adjusts overtime based on risk mode', () => {
    const conservative = calculateROI(mockInputs, RiskMode.CONSERVATIVE);
    const aggressive = calculateROI(mockInputs, RiskMode.AGGRESSIVE);

    expect(conservative.overtimeDrag).toBe(100000 * MULTIPLIERS.OVERTIME_SAVINGS.CONSERVATIVE);
    expect(aggressive.overtimeDrag).toBe(100000 * MULTIPLIERS.OVERTIME_SAVINGS.AGGRESSIVE);
  });

  it('estimates spend when inputs are 0', () => {
    const inputsWithoutSpend = { ...mockInputs, annualOvertimeSpend: 0, annualWorkersComp: 0 };
    const result = calculateROI(inputsWithoutSpend, RiskMode.STANDARD);
    
    // Payroll = 100 * 100,000 = 10,000,000
    const payroll = 100 * 100000;
    
    // Est OT = 12% of 10M = 1.2M. Savings (Standard 10%) = 120,000
    expect(result.overtimeDrag).toBe(payroll * 0.12 * MULTIPLIERS.OVERTIME_SAVINGS.STANDARD);
    
    // Est WC = 3% of 10M = 300k. Savings (Standard 6%) = 18,000
    expect(result.workersCompDrag).toBe(payroll * 0.03 * MULTIPLIERS.COMP_REDUCTION.STANDARD);
  });
});