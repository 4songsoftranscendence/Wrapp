import React, { useState } from 'react';
import { Package, Upload } from 'lucide-react';

// Define Card components inline since we can't use the external library
const Card = ({ className, children }) => (
  <div className={`bg-gradient-to-b from-white to-purple-50 rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ className, children }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ className, children }) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const GiftWrapper = () => {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: ''
  });
  const [result, setResult] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const detectDimensions = async (imageElement) => {
    if (!model) return null;

    try {
      const predictions = await model.detect(imageElement);
      
      // Find the box prediction with highest confidence
      const box = predictions[0]?.bbox;
      if (box) {
        const [x, y, width, height] = box;
        
        // Convert pixel measurements to approximate inches
        // This is a simplified conversion - would need calibration
        const PIXELS_PER_INCH = 96; // This is an approximation
        
        return {
          length: Math.round(width / PIXELS_PER_INCH * 10) / 10,
          width: Math.round(height / PIXELS_PER_INCH * 10) / 10,
          // Estimate depth based on width/height ratio
          height: Math.round((width * 0.3) / PIXELS_PER_INCH * 10) / 10
        };
      }
      return null;
    } catch (error) {
      console.error('Error detecting dimensions:', error);
      return null;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLoading(true);
      
      const reader = new FileReader();
      reader.onload = async () => {
        setImage(reader.result);
        
        // Create an image element for detection
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          const detectedDimensions = await detectDimensions(img);
          if (detectedDimensions) {
            setDimensions(detectedDimensions);
          } else {
            // Fallback to default dimensions if detection fails
            setDimensions({
              length: '10',
              width: '8',
              height: '4'
            });
          }
          setLoading(false);
        };
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
      <ol className="mt-2 md:mt-4 space-y-1 md:space-y-2 text-xs md:text-sm">
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
    <Card className="w-full max-w-[95%] md:max-w-md">
      <CardHeader>
        <CardTitle className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-purple-600">
            <Package className="h-6 w-6 md:h-8 md:w-8" />
            Wrapp
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 font-normal">The app that helps you wrap!</p>
        </CardTitle>
        <div className="mt-4 text-center space-y-3">
          <p className="text-base md:text-lg font-semibold text-emerald-600">✨ No More Gift-Wrapping Guesswork! ✨</p>
          <p className="text-sm md:text-base text-purple-600 font-medium">Tired of wonky wrapping jobs? Done with wasting paper on failed attempts?</p>
          <p className="text-sm md:text-base text-purple-600 font-medium">Wrapp is here to make wrapping fun!</p>
          <div className="text-xs md:text-sm text-gray-600 space-y-2 bg-purple-50 p-3 rounded-lg">
            <p className="font-medium">Get the perfect wrap in three easy steps:</p>
            <p>✨ Take a photo of your gift with a credit card or quarter next to it</p>
            <p>📏 Get the exact amount of wrapping paper you need</p>
            <p>🎁 Follow our simple folding instructions</p>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-1">* Place the reference item (credit card or quarter) flat next to your gift</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload Gift Image
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 md:h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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
                      className="max-h-28 md:max-h-40 w-auto mx-auto object-contain"
                    />
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2 text-gray-500" />
                    <p className="mb-1 md:mb-2 text-xs md:text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 hidden md:block">PNG, JPG, GIF up to 10MB</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Length (in)</label>
            <input
              type="number"
              min="0"
              className="w-full p-1 md:p-2 border rounded text-sm md:text-base"
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
          className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 font-medium shadow-sm"
          onClick={calculatePaper}
          disabled={loading || !dimensions.length || !dimensions.width || !dimensions.height}
        >
          Calculate
        </button>

        {result && (
          <div className="mt-3 md:mt-4">
            <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Required Paper Size:</h3>
            <p className="mb-2">
              <span className="text-sm md:text-base">{result.paperLength}" × {result.paperWidth}"</span>
              <span className="text-xs md:text-sm text-gray-500 ml-2">
                (Area: {result.surfaceArea} sq in)
              </span>
            </p>
            <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Folding Instructions:</h3>
            {getFoldingInstructions()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GiftWrapper;