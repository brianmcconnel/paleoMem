#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const jiti = require('jiti')(path.join(__dirname, 'verify-display.js'));

const {
  auditAllVerseDisplays,
  formatDisplayVerificationReport,
} = jiti('../lib/display-verification.ts');

const args = process.argv.slice(2);
const writeJson = args.includes('--json') || args.includes('--write-report');
const failOnUnexpected = !args.includes('--allow-expected');

const report = auditAllVerseDisplays();
const formatted = formatDisplayVerificationReport(report);

console.log(formatted);

if (writeJson) {
  const reportsDir = path.join(__dirname, '..', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const outPath = path.join(reportsDir, 'display-verification-report.json');
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nWrote ${outPath}`);
}

const hasUnexpected =
  report.totals.unexpectedEnglishIssues > 0 || report.totals.unexpectedHebrewIssues > 0;

if (failOnUnexpected && hasUnexpected) {
  process.exit(1);
}

console.log('\nDisplay verification finished.');