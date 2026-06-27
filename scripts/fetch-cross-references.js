const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseTskLine } = require('./tsk-book-abbrev');

const ZIP_URL = 'https://a.openbible.info/data/cross-references.zip';
const CACHE_DIR = path.join(__dirname, '../data/.cache');
const ZIP_PATH = path.join(CACHE_DIR, 'cross-references.zip');
const TXT_PATH = path.join(CACHE_DIR, 'cross_references.txt');
const DATA_DIR = path.join(__dirname, '../data');
const OUT_JSON_PATH = path.join(DATA_DIR, 'cross-refs-out.json');
const IN_JSON_PATH = path.join(DATA_DIR, 'cross-refs-in.json');
const META_JSON_PATH = path.join(DATA_DIR, 'cross-refs-meta.json');
const TOP_N = 25;

async function ensureSourceFile() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (!fs.existsSync(TXT_PATH)) {
    console.log('Downloading OpenBible.info TSK cross-references…');
    const response = await fetch(ZIP_URL);
    if (!response.ok) {
      throw new Error(`Failed to download cross-references.zip (${response.status})`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(ZIP_PATH, buffer);
    execSync(`unzip -o -q "${ZIP_PATH}" -d "${CACHE_DIR}"`);
  }
}

async function main() {
  await ensureSourceFile();
  const raw = fs.readFileSync(TXT_PATH, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);

  /** @type {Map<number, Map<number, number>>} */
  const bySource = new Map();
  /** @type {Map<number, Map<number, number>>} */
  const byTarget = new Map();
  let parsed = 0;
  let skipped = 0;

  for (const line of lines) {
    if (line.startsWith('From Verse') || line.includes('openbible.info')) continue;

    const record = parseTskLine(line);
    if (!record) {
      skipped += 1;
      continue;
    }

    let sourceMap = bySource.get(record.fromVid);
    if (!sourceMap) {
      sourceMap = new Map();
      bySource.set(record.fromVid, sourceMap);
    }

    for (const toVid of record.targets) {
      const prevOut = sourceMap.get(toVid) ?? 0;
      if (record.votes > prevOut) sourceMap.set(toVid, record.votes);

      let incomingMap = byTarget.get(toVid);
      if (!incomingMap) {
        incomingMap = new Map();
        byTarget.set(toVid, incomingMap);
      }
      const prevIn = incomingMap.get(record.fromVid) ?? 0;
      if (record.votes > prevIn) incomingMap.set(record.fromVid, record.votes);

      parsed += 1;
    }
  }

  let maxVotes = 0;
  let edgeCount = 0;
  const topOutgoing = {};
  const topIncoming = {};

  const toTopPairs = (targetMap) => {
    const sorted = [...targetMap.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted[0] && sorted[0][1] > maxVotes) maxVotes = sorted[0][1];
    return sorted.slice(0, TOP_N).map(([vid, votes]) => [vid, votes]);
  };

  for (const [fromVid, targetMap] of bySource.entries()) {
    edgeCount += targetMap.size;
    topOutgoing[String(fromVid)] = toTopPairs(targetMap);
  }

  for (const [toVid, sourceMap] of byTarget.entries()) {
    topIncoming[String(toVid)] = toTopPairs(sourceMap);
  }

  const meta = {
    source: 'OpenBible.info Treasury of Scripture Knowledge (CC BY 4.0)',
    url: 'https://a.openbible.info/data/cross-references.zip',
    fetchedAt: new Date().toISOString().slice(0, 10),
    edgeCount,
    sourceVerseCount: bySource.size,
    maxVotes,
    topN: TOP_N,
  };

  fs.writeFileSync(OUT_JSON_PATH, JSON.stringify(topOutgoing));
  fs.writeFileSync(IN_JSON_PATH, JSON.stringify(topIncoming));
  fs.writeFileSync(META_JSON_PATH, JSON.stringify(meta, null, 2));

  const outSize = fs.statSync(OUT_JSON_PATH).size;
  const inSize = fs.statSync(IN_JSON_PATH).size;
  console.log(`Parsed ${parsed.toLocaleString()} edge rows (${skipped} lines skipped)`);
  console.log(
    `${edgeCount.toLocaleString()} unique edges from ${bySource.size.toLocaleString()} source verses`,
  );
  console.log(`Wrote ${OUT_JSON_PATH} (${(outSize / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Wrote ${IN_JSON_PATH} (${(inSize / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Wrote ${META_JSON_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});