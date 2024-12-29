import React, { useState, useRef, useEffect } from 'react';
import { Package, Upload } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

// Card components stay the same
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
  const [debugInfo, setDebugInfo] = useState({
    detectedObject: '',
    confidence: 0,
    bbox: null
  });
  const imageRef = useRef(null);

  // Load COCO-SSD model when component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setLoading(false);
      }
    };
    loadModel();
  }, []);

  const measureWithReference = async (imgElement) => {
    if (!model) return null;

    try {
      // Detect objects in the image
      const predictions = await model.detect(imgElement);
      
      // Find the object with highest confidence
      const mainObject = predictions.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
      );

      if (mainObject) {
        // Get bounding box
        const [x, y, width, height] = mainObject.bbox;
        
        // Credit card standard width in inches
        const creditCardWidth = 3.375;
        
        // Find credit card in predictions for scale
        const creditCard = predictions.find(p => p.class.includes('card'));
        let pixelsPerInch;
        
        if (creditCard) {
          pixelsPerInch = creditCard.bbox[2] / creditCardWidth;
        } else {
          // Fallback: assume credit card takes up 25% of image width
          pixelsPerInch = (imgElement.width * 0.25) / creditCardWidth;
        }

        // Convert pixels to inches
        const objectWidthInches = width / pixelsPerInch;
        const objectHeightInches = height / pixelsPerInch;
        
        // Determine if object is flat or cylindrical based on class and dimensions
        const isFlat = mainObject.class.includes('book') || 
                      mainObject.class.includes('laptop') ||
                      mainObject.class.includes('cell phone');
        
        const isCylindrical = mainObject.class.includes('bottle') ||
                            mainObject.class.includes('cup') ||
                            mainObject.class.includes('wine glass');

        setDebugInfo({
          detectedObject: mainObject.class,
          confidence: Math.round(mainObject.score * 100),
          bbox: mainObject.bbox
        });

        let objectHeight;
        if (isFlat) {
          objectHeight = 0.2; // Very thin for flat objects
        } else if (isCylindrical) {
          objectHeight = Math.min(objectWidthInches, objectHeightInches); // Circular cross-section
        } else {
          objectHeight = Math.min(objectWidthInches, objectHeightInches) * 0.3; // Default box-like ratio
        }

        return {
          length: Math.round(Math.max(objectWidthInches, objectHeightInches) * 2) / 2,
          width: Math.round(Math.min(objectWidthInches, objectHeightInches) * 2) / 2,
          height: Math.round(objectHeight * 2) / 2
        };
      }
    } catch (error) {
      console.error('Error detecting objects:', error);
    }
    
    return null;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        setImage(reader.result);
        
        // Create an image element to measure
        const img = new Image();
        img.src = reader.result;
        img.onload = async () => {
          const measuredDimensions = await measureWithReference(img);
          if (measuredDimensions) {
            setDimensions(measuredDimensions);
          }
          setLoading(false);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Rest of your component stays the same (calculatePaper, getFoldingInstructions, etc.)
  // ... 

  return (
    <Card className="w-full max-w-[95%] md:max-w-md">
      {/* ... Header section stays the same ... */}
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
                  <div className="relative w-full h-full flex flex-col items-center">
                    <div className="text-xs text-gray-600 mb-2 bg-gray-100 p-2 rounded">
                      {debugInfo.detectedObject ? (
                        <>
                          <p className="font-medium mb-1">Analysis Results:</p>
                          <p>• We detected a {debugInfo.detectedObject}</p>
                          <p>• Confidence in measurements: {debugInfo.confidence >= 90 ? 'Very High' : 
                             debugInfo.confidence >= 75 ? 'High' :
                             debugInfo.confidence >= 50 ? 'Moderate' : 'Low'} 
                             ({debugInfo.confidence}%)
                          </p>
                          <p className="mt-1 text-gray-500 italic">
                            {debugInfo.confidence < 75 ? 
                              "Tip: Try taking another photo with better lighting and the credit card clearly visible" : 
                              "Looks good! These measurements should be accurate"}
                          </p>
                        </>
                      ) : loading ? (
                        <p>Analyzing your gift...</p>
                      ) : (
                        <p>Ready to analyze your gift</p>
                      )}
                    </div>
                    <img
                      ref={imageRef}
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

        {/* ... Rest of your component stays the same ... */}
      </CardContent>
    </Card>
  );
};

export default GiftWrapper;