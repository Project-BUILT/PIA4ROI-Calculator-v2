import jsPDF from 'jspdf';
import { CalculatorInputs, CalculationResult, RiskMode } from './types';
import { formatCurrency } from './calculations';

export const generateCouncilReport = (
  inputs: CalculatorInputs,
  results: CalculationResult,
  mode: RiskMode
) => {
  const doc = new jsPDF();
  let y = 20;
  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  const pageHeight = 290;

  const checkPageBreak = (heightNeeded: number = 10) => {
    if (y + heightNeeded > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }
  };

  const addHeading = (text: string, size: number = 14) => {
    checkPageBreak(15);
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(text, margin, y);
    y += (size / 2) + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
  };

  const addLine = () => {
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, margin + contentWidth, y);
    y += 8;
  };

  // --- HEADER ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('Fiscal Impact & Readiness Brief', margin, y);
  y += 10;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  const deptName = inputs.profile?.departmentName || `${inputs.agencyType} Leadership`;
  doc.text(`Prepared for: ${deptName}`, margin, y);
  
  const dateStr = new Date().toLocaleDateString();
  doc.text(`Date: ${dateStr}`, pageWidth - margin - 30, y);
  y += 6;
  if (inputs.profile?.city) {
    doc.text(`Jurisdiction: ${inputs.profile.city}, ${inputs.profile.state}`, margin, y);
  }
  y += 15;
  
  addLine();

  // --- 1. DECISION ASK ---
  addHeading("1. Decision & Executive Summary", 14);
  
  doc.setFont("helvetica", "bold");
  doc.text(`DECISION REQUEST: Approve 90-Day Pilot (${results.numRooms} Unit${results.numRooms > 1 ? 's' : ''})`, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  
  const summary = `Based on a headcount of ${inputs.headcount}, our analysis identifies an estimated annual avoidable loss of ${formatCurrency(results.totalAvoidableLoss)}. We propose a 90-day pilot to mitigate turnover drag, overtime inefficiency, and liability exposure.`;
  const splitSummary = doc.splitTextToSize(summary, contentWidth);
  doc.text(splitSummary, margin, y);
  y += (splitSummary.length * 5) + 6;

  // --- 2. FINANCIAL ANALYSIS ---
  checkPageBreak(50);
  addHeading("2. Financial Analysis", 14);
  
  // Financial Grid (Text based)
  const col1 = margin;
  const col2 = margin + 60;
  const col3 = margin + 120;

  doc.setFont("helvetica", "bold");
  doc.text("Annual Avoidable Loss", col1, y);
  doc.text("Pilot Cost (Year 1)", col2, y);
  doc.text("Projected Payback", col3, y);
  y += 6;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(formatCurrency(results.totalAvoidableLoss), col1, y);
  doc.text(`${formatCurrency(results.pilotCost)}*`, col2, y);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(`${results.paybackMonths} Months`, col3, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Status Quo Cost", col1, y);
  doc.text(`*Includes ${results.numRooms} Room(s) Capex`, col2, y);
  doc.text(`Break-even: ~${results.breakEvenDays} days`, col3, y);
  y += 15;

  // Sensitivity Table
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Sensitivity Analysis (Budget Impact Scenarios)", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  
  // Header Row
  const tCol1 = margin;
  const tCol2 = margin + 40;
  const tCol3 = margin + 85;
  const tCol4 = margin + 130;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Scenario", tCol1, y);
  doc.text("Annual Loss", tCol2, y);
  doc.text("Net Benefit (Yr 1)", tCol3, y);
  doc.text("ROI", tCol4, y);
  y += 5;

  // Rows
  [results.sensitivity.conservative, results.sensitivity.standard, results.sensitivity.aggressive].forEach(row => {
    checkPageBreak();
    if (row.mode === mode) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    
    doc.setTextColor(0);
    doc.text(row.mode, tCol1, y);
    doc.text(formatCurrency(row.totalAnnualLoss), tCol2, y);
    doc.text(formatCurrency(row.netBenefit), tCol3, y);
    doc.text(`${row.roiMultiplier.toFixed(0)}%`, tCol4, y);
    y += 6;
  });
  doc.setFont("helvetica", "normal");
  y += 10;

  // --- 3. IMPLEMENTATION PLAN ---
  checkPageBreak(50);
  addHeading("3. Implementation Plan (90 Days)", 14);
  
  const phases = [
    { name: "Phase 1: Days 0-14", desc: `Hardware install (${results.numRooms} Units), Supervisor onboarding, Policy update.` },
    { name: "Phase 2: Days 15-45", desc: "Utilization ramp, Roll-call reminders, Initial metric tracking." },
    { name: "Phase 3: Days 46-90", desc: "Optimization, Interim review, Council report preparation." }
  ];

  phases.forEach(p => {
    checkPageBreak();
    doc.setFont("helvetica", "bold");
    doc.text(p.name, margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(p.desc, margin, y);
    y += 10;
  });

  // --- 4. RISK REGISTER ---
  checkPageBreak(50);
  addHeading("4. Risk Register & Mitigation", 14);

  const risks = [
    { r: "Perception ('Nap Room')", m: "Frame as 'Readiness Maintenance'; Supervisor endorsement." },
    { r: "Low Utilization", m: "Unit champions; Confidentiality assurance; Simplified access." },
    { r: "Privacy Concerns", m: "Third-party managed data; No PHI collected." }
  ];

  doc.setFontSize(9);
  risks.forEach(item => {
    checkPageBreak();
    doc.setFont("helvetica", "bold");
    doc.text(`Risk: ${item.r}`, margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.text(`Mitigation: ${item.m}`, margin, y);
    y += 8;
  });
  y += 5;

  // --- APPENDIX: MATH ---
  checkPageBreak(60);
  addHeading("Appendix: Methodology Inputs", 12);
  doc.setFontSize(9);
  doc.text(`Total Headcount: ${inputs.headcount}`, margin, y); y += 5;
  doc.text(`Avg Fully Loaded Cost: ${formatCurrency(inputs.avgFullyLoadedCost)}`, margin, y); y += 5;
  doc.text(`Turnover Rate: ${inputs.turnoverRatePct || 10}%`, margin, y); y += 5;
  doc.text(`Turnover Drag: ${formatCurrency(results.turnoverDrag)}`, margin, y); y += 5;
  doc.text(`Overtime Drag: ${formatCurrency(results.overtimeDrag)}`, margin, y); y += 5;
  doc.text(`Liability Drag: ${formatCurrency(results.liabilityDrag)}`, margin, y); y += 5;

  // --- DISCLAIMER ---
  y = pageHeight - 30; // Footer area
  doc.setDrawColor(0);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(100);
  const disclaimer = "DISCLAIMER: This report estimates potential budget drag based on user inputs and national baselines. Results vary by implementation fidelity. We do not guarantee reductions in medical claims, lawsuits, or specific outcomes. This is not legal or medical advice.";
  const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(splitDisclaimer, margin, y);

  doc.save('Council_Readiness_Brief.pdf');
};