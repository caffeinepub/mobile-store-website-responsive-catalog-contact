export interface ParsedProduct {
  name: string;
  brand: string;
  category: string;
  price: number | null;
  imageUrl?: string;
  description?: string;
  isValid: boolean;
}

export interface ParseError {
  row: number;
  field: string;
  message: string;
}

interface ParseResult {
  products: ParsedProduct[];
  errors: ParseError[];
}

/**
 * Parse a CSV or XLSX file and extract product data
 * Supports both .csv and .xlsx formats
 */
export async function parseProductImportFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
    return parseCSV(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseXLSX(file);
  } else {
    throw new Error('Unsupported file format. Please upload a .csv or .xlsx file.');
  }
}

/**
 * Parse CSV file
 */
async function parseCSV(file: File): Promise<ParseResult> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('File is empty');
  }

  // Parse header
  const header = parseCSVLine(lines[0]);
  const columnMap = mapColumns(header);

  // Validate required columns exist
  if (columnMap.name === undefined || columnMap.brand === undefined || 
      columnMap.category === undefined || columnMap.price === undefined) {
    const missing: string[] = [];
    if (columnMap.name === undefined) missing.push('Name');
    if (columnMap.brand === undefined) missing.push('Brand');
    if (columnMap.category === undefined) missing.push('Category');
    if (columnMap.price === undefined) missing.push('Price');
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }

  const products: ParsedProduct[] = [];
  const errors: ParseError[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const rowNumber = i + 1;

    // Skip empty rows
    if (values.every(v => !v.trim())) continue;

    try {
      const product = extractProductFromRow(values, columnMap, rowNumber);
      products.push(product);
      
      if (!product.isValid) {
        validateProduct(product, rowNumber, errors);
      }
    } catch (error) {
      errors.push({
        row: rowNumber,
        field: 'row',
        message: error instanceof Error ? error.message : 'Failed to parse row',
      });
    }
  }

  return { products, errors };
}

/**
 * Parse XLSX file using SheetJS library
 */
async function parseXLSX(file: File): Promise<ParseResult> {
  try {
    // Use dynamic import with type assertion for CDN module
    // @ts-ignore - CDN import not recognized by TypeScript
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Spreadsheet contains no sheets');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to array of arrays
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (data.length === 0) {
      throw new Error('Spreadsheet is empty');
    }

    const header = data[0].map(cell => String(cell || '').trim());
    const columnMap = mapColumns(header);

    // Validate required columns exist
    if (columnMap.name === undefined || columnMap.brand === undefined || 
        columnMap.category === undefined || columnMap.price === undefined) {
      const missing: string[] = [];
      if (columnMap.name === undefined) missing.push('Name');
      if (columnMap.brand === undefined) missing.push('Brand');
      if (columnMap.category === undefined) missing.push('Category');
      if (columnMap.price === undefined) missing.push('Price');
      throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }

    const products: ParsedProduct[] = [];
    const errors: ParseError[] = [];

    // Parse data rows
    for (let i = 1; i < data.length; i++) {
      const values = data[i].map(cell => String(cell || '').trim());
      const rowNumber = i + 1;

      // Skip empty rows
      if (values.every(v => !v)) continue;

      try {
        const product = extractProductFromRow(values, columnMap, rowNumber);
        products.push(product);
        
        if (!product.isValid) {
          validateProduct(product, rowNumber, errors);
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          field: 'row',
          message: error instanceof Error ? error.message : 'Failed to parse row',
        });
      }
    }

    return { products, errors };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Missing required columns')) {
      throw error;
    }
    throw new Error('Failed to parse Excel file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Map column headers to indices
 */
function mapColumns(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  
  header.forEach((col, idx) => {
    const normalized = col.toLowerCase().trim();
    
    // Match name columns
    if (normalized.includes('name') || normalized === 'product' || normalized.includes('item')) {
      map.name = idx;
    } 
    // Match brand columns
    else if (normalized.includes('brand') || normalized.includes('make') || normalized.includes('manufacturer')) {
      map.brand = idx;
    } 
    // Match category columns
    else if (normalized.includes('category') || normalized.includes('type') || normalized.includes('group')) {
      map.category = idx;
    } 
    // Match price columns
    else if (normalized.includes('price') || normalized.includes('cost') || normalized.includes('amount') || normalized.includes('rate')) {
      map.price = idx;
    } 
    // Match image columns
    else if (normalized.includes('image') || normalized.includes('url') || normalized.includes('photo') || normalized.includes('picture')) {
      map.imageUrl = idx;
    } 
    // Match description columns
    else if (normalized.includes('description') || normalized.includes('desc') || normalized.includes('details') || normalized.includes('info')) {
      map.description = idx;
    }
  });

  return map;
}

/**
 * Extract product data from a row
 */
function extractProductFromRow(
  values: string[],
  columnMap: Record<string, number>,
  rowNumber: number
): ParsedProduct {
  const name = columnMap.name !== undefined ? values[columnMap.name]?.trim() : '';
  const brand = columnMap.brand !== undefined ? values[columnMap.brand]?.trim() : '';
  const category = columnMap.category !== undefined ? values[columnMap.category]?.trim() : '';
  const priceStr = columnMap.price !== undefined ? values[columnMap.price]?.trim() : '';
  const imageUrl = columnMap.imageUrl !== undefined ? values[columnMap.imageUrl]?.trim() : '';
  const description = columnMap.description !== undefined ? values[columnMap.description]?.trim() : '';

  // Parse price - handle various formats
  let price: number | null = null;
  if (priceStr) {
    // Remove currency symbols, commas, and whitespace
    const cleanPrice = priceStr.replace(/[₹$,\s]/g, '');
    const parsed = parseFloat(cleanPrice);
    if (!isNaN(parsed) && parsed > 0) {
      price = Math.round(parsed);
    }
  }

  // Validate required fields
  const isValid = !!(name && brand && category && price !== null && price > 0);

  return {
    name,
    brand,
    category,
    price,
    imageUrl: imageUrl || undefined,
    description: description || undefined,
    isValid,
  };
}

/**
 * Validate product and add errors
 */
function validateProduct(product: ParsedProduct, rowNumber: number, errors: ParseError[]): void {
  if (!product.name) {
    errors.push({ row: rowNumber, field: 'name', message: 'Name is required' });
  }
  if (!product.brand) {
    errors.push({ row: rowNumber, field: 'brand', message: 'Brand is required' });
  }
  if (!product.category) {
    errors.push({ row: rowNumber, field: 'category', message: 'Category is required' });
  }
  if (product.price === null || product.price <= 0) {
    errors.push({ row: rowNumber, field: 'price', message: 'Valid price is required' });
  }
}
