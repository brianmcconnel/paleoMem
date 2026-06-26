#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const jiti = require('jiti')(path.join(__dirname, 'verify-display.js'));

const {
  auditDisplayVerification,
  formatDisplayVerificationReport,
} = jiti('../lib/display-verification.ts');

const args = process.argv.slice(2);
const writeJson = args.includes('--json') || args.includes('--write-report');
const failOnUnexpected = !args.includes('--allow-expected');

const report = auditDisplayVerification();
const formatted = formatDisplayVerificationReport(report);

console.log(formatted);

if (writeJson) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const outPath = path.join(reportsDir, 'display-verification-report.json');
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nWrote ${outPath}`);
}

const ot = report.oldTestament.totals;
const nt = report.newTestament.totals;
const hasUnexpected =
  ot.unexpectedEnglishIssues > 0 ||
  ot.unexpectedSecondaryIssues > 0 ||
  nt.unexpectedEnglishIssues > 0 ||
  nt.unexpectedSecondaryIssues > 0;

if (failOnUnexpected && hasUnexpected) {
  process.exit(1);
}

console.log('\nDisplay verification finished.');