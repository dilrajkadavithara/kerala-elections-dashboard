import XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const dataDir = join(projectRoot, 'data');
const excelPath = join(projectRoot, '..', 'Kerala_Elections_Dashboard_Ready.xlsx');

console.log('Reading Excel file:', excelPath);
const workbook = XLSX.readFile(excelPath);

console.log('Sheet names:', workbook.SheetNames);

const sheetMapping = {
  'Constituencies': 'constituencies.json',
  'Assembly_Elections': 'assembly_elections.json',
  'LokSabha_Elections': 'loksabha_elections.json',
  'Category_Analysis': 'category_analysis.json',
};

for (const [sheetName, fileName] of Object.entries(sheetMapping)) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    console.warn(`Sheet "${sheetName}" not found, trying alternatives...`);
    // Try to find a matching sheet name (case-insensitive or partial match)
    const match = workbook.SheetNames.find(
      (s) => s.toLowerCase().replace(/\s+/g, '_') === sheetName.toLowerCase()
        || s.toLowerCase().includes(sheetName.toLowerCase().split('_')[0])
    );
    if (match) {
      console.log(`  Found matching sheet: "${match}"`);
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[match]);
      const outPath = join(dataDir, fileName);
      writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`  ✓ ${fileName}: ${data.length} records`);
    } else {
      console.error(`  ✗ No matching sheet found for "${sheetName}"`);
    }
    continue;
  }
  const data = XLSX.utils.sheet_to_json(sheet);
  const outPath = join(dataDir, fileName);
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`✓ ${fileName}: ${data.length} records`);
}

console.log('\nDone! JSON files written to', dataDir);
