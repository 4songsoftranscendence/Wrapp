import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Package, Upload } from 'lucide-react';

const GiftWrapper = () => {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: ''
  });
  const [result, setResult] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        // Simulate dimension detection with placeholder values
        setTimeout(() => {
          setDimensions({
            length: '10',
            width: '8',
            height: '4'
          });
          setLoading(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatePaper = () => {
    const { length, width, height } = dimensions;
    if (!length || !width || !height) return;

    // Convert strings to numbers
    const l = Number(length);
    const w = Number(width);
    const h = Number(height);

    // Calculate paper dimensions
    // We need enough paper to wrap around the length and width
    // plus extra for the sides (2 * height each side)
    const paperLength = l + w + l + w + 4; // Extra 4 inches for overlap
    const paperWidth = 2 * h + w + 4; // Extra 4 inches for folding edges

    // Calculate surface area for reference
    const surfaceArea = paperLength * paperWidth;

    setResult({
      paperLength: Math.ceil(paperLength),
      paperWidth: Math.ceil(paperWidth),
      surfaceArea: Math.ceil(surfaceArea)
    });
  };

  const getFoldingInstructions = () => {
    if (!result) return null;
    
    return (
      <ol className="mt-4 space-y-2 text-sm">
        <li>1. Cut paper to {result.paperLength}" × {result.paperWidth}"</li>
        <li>2. Place gift face down in the center of paper</li>
        <li>3. Bring long sides together and overlap by 2", tape</li>
        <li>4. At each end, fold sides in at 45° angle</li>
        <li>5. Fold up bottom flap and tape</li>
        <li>6. Fold down top flap and tape</li>
      </ol>
    );
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          Gift Wrapping Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload Gift Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {loading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-8 bg-gray-300 rounded-full mb-2"></div>
                    <p className="text-sm text-gray-500">Analyzing image...</p>
                  </div>
                ) : image ? (
                  <div className="relative w-full h-full">
                    <img
                      src={image}
                      alt="Uploaded gift"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length (in)</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded"
              value={dimensions.length}
              onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Width (in)</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded"
              value={dimensions.width}
              onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (in)</label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded"
              value={dimensions.height}
              onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
            />
          </div>
        </div>

        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300"
          onClick={calculatePaper}
          disabled={loading || !dimensions.length || !dimensions.width || !dimensions.height}
        >
          Calculate
        </button>

        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Required Paper Size:</h3>
            <p className="mb-2">
              {result.paperLength}" × {result.paperWidth}"
              <span className="text-sm text-gray-500 ml-2">
                (Area: {result.surfaceArea} sq in)
              </span>
            </p>
            <h3 className="font-medium mb-2">Folding Instructions:</h3>
            {getFoldingInstructions()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GiftWrapper;