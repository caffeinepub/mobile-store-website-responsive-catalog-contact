import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useImportProducts } from '../../hooks/useQueries';
import { parseProductImportFile, type ParsedProduct, type ParseError } from '../../utils/parseProductImportFile';

export default function ProductImportPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importMutation = useImportProducts();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParsedProducts([]);
    setParseErrors([]);
    setImportSuccess(false);
    setImportError(null);

    try {
      const result = await parseProductImportFile(file);
      setParsedProducts(result.products);
      setParseErrors(result.errors);
    } catch (error) {
      setParseErrors([{
        row: 0,
        field: 'file',
        message: error instanceof Error ? error.message : 'Failed to parse file',
      }]);
    }
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) return;

    const validProducts = parsedProducts.filter(p => p.isValid);
    if (validProducts.length === 0) {
      setImportError('No valid products to import');
      return;
    }

    setImportSuccess(false);
    setImportError(null);

    try {
      const productsToImport = validProducts.map(p => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: BigInt(Math.round(p.price!)),
        imageUrl: p.imageUrl || undefined,
        description: p.description || undefined,
      }));

      await importMutation.mutateAsync(productsToImport);

      setImportSuccess(true);
      setImportError(null);

      // Clear after successful import
      setTimeout(() => {
        setParsedProducts([]);
        setParseErrors([]);
        setFileName('');
        setImportSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } catch (error) {
      setImportSuccess(false);
      setImportError(error instanceof Error ? error.message : 'Failed to import products');
    }
  };

  const validCount = parsedProducts.filter(p => p.isValid).length;
  const invalidCount = parsedProducts.length - validCount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Products from Spreadsheet
          </CardTitle>
          <CardDescription>
            Upload an Excel (.xlsx) or CSV (.csv) file to import products. Required columns: Name, Brand, Category, Price
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            {fileName && (
              <span className="text-sm text-muted-foreground">
                {fileName}
              </span>
            )}
          </div>

          {parseErrors.length > 0 && parseErrors[0].field === 'file' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{parseErrors[0].message}</AlertDescription>
            </Alert>
          )}

          {parsedProducts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-sm">
                    {validCount} Valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={handleImport}
                  disabled={validCount === 0 || importMutation.isPending}
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {validCount} Products
                    </>
                  )}
                </Button>
              </div>

              {importMutation.isPending && (
                <div className="space-y-2">
                  <Progress value={50} className="animate-pulse" />
                  <p className="text-sm text-muted-foreground text-center">
                    Importing {validCount} products...
                  </p>
                </div>
              )}

              {importSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {validCount} products!
                  </AlertDescription>
                </Alert>
              )}

              {importError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {importError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {parsedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Review the parsed products before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Image URL</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, idx) => (
                    <TableRow key={idx} className={!product.isValid ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        {product.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name || <span className="text-muted-foreground italic">Missing</span>}
                      </TableCell>
                      <TableCell>
                        {product.brand || <span className="text-muted-foreground italic">Missing</span>}
                      </TableCell>
                      <TableCell>
                        {product.category || <span className="text-muted-foreground italic">Missing</span>}
                      </TableCell>
                      <TableCell>
                        {product.price !== null ? `₹${product.price.toLocaleString('en-IN')}` : <span className="text-muted-foreground italic">Missing</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {product.imageUrl || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {product.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {parseErrors.length > 0 && parseErrors[0].field !== 'file' && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Validation Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {parseErrors.slice(0, 5).map((error, idx) => (
                      <li key={idx}>
                        Row {error.row}: {error.field} - {error.message}
                      </li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li className="text-muted-foreground">
                        ... and {parseErrors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
