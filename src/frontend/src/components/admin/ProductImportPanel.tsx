import { useState } from 'react';
import { useImportProducts } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, CheckCircle2, AlertCircle, Loader2, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { parseProductImportFile, ParsedProduct, ParseError } from '../../utils/parseProductImportFile';

interface ProductCandidate {
  name: string;
  brand: string;
  category: string;
  price: bigint;
  imageUrl?: string;
  description?: string;
}

interface ProductWithErrors extends ParsedProduct {
  parseErrors?: string[];
}

export default function ProductImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<ProductWithErrors[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const importMutation = useImportProducts();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setParsedProducts([]);
    setImportSuccess(false);

    try {
      const result = await parseProductImportFile(selectedFile);
      
      // Map ParseResult to ProductWithErrors format
      const productsWithErrors: ProductWithErrors[] = result.products.map((product) => {
        // Find errors for this product by checking if any error references fields in this product
        const productErrors = result.errors
          .filter((err) => {
            // Group errors by row - we need to match row numbers
            // Since we don't have row numbers in ParsedProduct, we'll attach all errors as general errors
            return true; // For now, we'll show all errors
          })
          .map((err) => `Row ${err.row}, ${err.field}: ${err.message}`);

        return {
          ...product,
          parseErrors: productErrors.length > 0 ? productErrors : undefined,
        };
      });

      setParsedProducts(productsWithErrors);
      
      // If there are parse errors, show them
      if (result.errors.length > 0) {
        const errorSummary = result.errors
          .slice(0, 3)
          .map((err) => `Row ${err.row}: ${err.message}`)
          .join('; ');
        setParseError(
          result.errors.length > 3
            ? `${errorSummary}... and ${result.errors.length - 3} more errors`
            : errorSummary
        );
      }
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse file');
      setParsedProducts([]);
    }
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) return;

    // Filter out products with parse errors and convert to backend format
    const validProducts: ProductCandidate[] = parsedProducts
      .filter((p) => p.isValid && (!p.parseErrors || p.parseErrors.length === 0))
      .map((p) => ({
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: BigInt(p.price || 0),
        imageUrl: p.imageUrl,
        description: p.description,
      }));

    if (validProducts.length === 0) {
      setParseError('No valid products to import. Please fix the errors in your file.');
      return;
    }

    try {
      setImportSuccess(false);
      await importMutation.mutateAsync(validProducts);
      setImportSuccess(true);
      // Clear the form after successful import
      setFile(null);
      setParsedProducts([]);
      // Reset file input
      const fileInput = document.getElementById('product-import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Import error:', error);
      // Error is handled by mutation error state
    }
  };

  const validProductCount = parsedProducts.filter((p) => p.isValid && (!p.parseErrors || p.parseErrors.length === 0)).length;
  const hasErrors = parsedProducts.some((p) => !p.isValid || (p.parseErrors && p.parseErrors.length > 0));

  // Check if the error is an authorization error
  const isUnauthorizedError = importMutation.error && 
    (importMutation.error.message.includes('Unauthorized') || 
     importMutation.error.message.includes('Only admins') ||
     importMutation.error.message.includes('permission'));

  return (
    <Card className="admin-card">
      <CardHeader>
        <CardTitle className="admin-card-title">Import Products</CardTitle>
        <CardDescription>
          Upload a CSV or Excel file to bulk import products
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="product-import-file" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <FileSpreadsheet className="h-5 w-5" />
                <span>Choose File</span>
              </div>
              <input
                id="product-import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            {file && (
              <span className="text-sm text-muted-foreground">
                {file.name}
              </span>
            )}
          </div>

          <Alert className="admin-info-alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Required columns:</strong> Name, Brand, Category, Price
              <br />
              <strong>Optional columns:</strong> Image URL, Description
            </AlertDescription>
          </Alert>
        </div>

        {/* Parse Error */}
        {parseError && (
          <Alert variant="destructive" className="admin-alert">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="admin-alert-title">Parse Error</AlertTitle>
            <AlertDescription className="admin-alert-description">{parseError}</AlertDescription>
          </Alert>
        )}

        {/* Import Success */}
        {importSuccess && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20 admin-success-alert">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">
              Import Successful
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              {validProductCount} {validProductCount === 1 ? 'product' : 'products'} imported successfully.
              The product catalog has been updated.
            </AlertDescription>
          </Alert>
        )}

        {/* Import Error */}
        {importMutation.isError && (
          <Alert variant="destructive" className="admin-alert">
            {isUnauthorizedError ? <ShieldAlert className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <AlertTitle className="admin-alert-title">
              {isUnauthorizedError ? 'Access Denied' : 'Import Failed'}
            </AlertTitle>
            <AlertDescription className="admin-alert-description">
              {isUnauthorizedError ? (
                <div className="space-y-2">
                  <p>You do not have permission to import products.</p>
                  <p className="text-sm">Admin access is required to modify the product catalog.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>Failed to import products:</p>
                  <code className="text-xs bg-background/50 px-2 py-1 rounded block mt-2 break-all">
                    {importMutation.error.message}
                  </code>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Preview Table */}
        {parsedProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold admin-section-title">Preview</h3>
                <p className="text-sm text-muted-foreground">
                  {validProductCount} valid {validProductCount === 1 ? 'product' : 'products'}
                  {hasErrors && ` (${parsedProducts.length - validProductCount} with errors)`}
                </p>
              </div>
              <Button
                onClick={handleImport}
                disabled={validProductCount === 0 || importMutation.isPending}
                className="admin-action-button"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {validProductCount} {validProductCount === 1 ? 'Product' : 'Products'}
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-md border admin-table-container max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="admin-table-head">Status</TableHead>
                    <TableHead className="admin-table-head">Name</TableHead>
                    <TableHead className="admin-table-head">Brand</TableHead>
                    <TableHead className="admin-table-head">Category</TableHead>
                    <TableHead className="admin-table-head">Price</TableHead>
                    <TableHead className="admin-table-head">Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedProducts.map((product, index) => {
                    const hasError = !product.isValid || (product.parseErrors && product.parseErrors.length > 0);
                    return (
                      <TableRow key={index} className={hasError ? 'bg-destructive/5 admin-table-row-error' : 'admin-table-row'}>
                        <TableCell>
                          {hasError ? (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name || '(empty)'}</TableCell>
                        <TableCell>{product.brand || '(empty)'}</TableCell>
                        <TableCell>{product.category || '(empty)'}</TableCell>
                        <TableCell>{product.price !== null ? `₹${product.price}` : '(invalid)'}</TableCell>
                        <TableCell>
                          {!product.isValid && (
                            <ul className="text-xs text-destructive space-y-1">
                              {!product.name && <li>• Name is required</li>}
                              {!product.brand && <li>• Brand is required</li>}
                              {!product.category && <li>• Category is required</li>}
                              {(product.price === null || product.price <= 0) && <li>• Valid price is required</li>}
                            </ul>
                          )}
                          {product.parseErrors && product.parseErrors.length > 0 && (
                            <ul className="text-xs text-destructive space-y-1">
                              {product.parseErrors.map((error, i) => (
                                <li key={i}>• {error}</li>
                              ))}
                            </ul>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
