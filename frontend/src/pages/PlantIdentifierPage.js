import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PlantIdentifierPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix to get pure base64
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleIdentify = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setIdentifying(true);
    try {
      const base64Image = await convertToBase64(selectedImage);
      
      const response = await axios.post(
        `${API}/identify-plant`,
        { image_base64: base64Image },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(response.data);
      toast.success('Plant identified successfully!');
    } catch (error) {
      console.error('Identification error:', error);
      toast.error(error.response?.data?.detail || 'Failed to identify plant');
    } finally {
      setIdentifying(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-[#1A4D2E] hover:bg-[#F5F5F0] rounded-full"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-2xl flex items-center justify-center">
              <Camera className="w-8 h-8 text-[#1A4D2E]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading tracking-tight text-[#1A4D2E] mb-4">
            AI Plant Identifier
          </h1>
          <p className="text-lg text-stone-600">
            Upload a photo of any plant to identify it and get care instructions
          </p>
        </motion.div>

        {/* Upload Section */}
        {!previewUrl ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-12 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] text-center"
            data-testid="upload-section"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              <div className="w-24 h-24 bg-[#F5F5F0] rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-[#1A4D2E]" />
              </div>
              <p className="text-xl font-heading font-medium text-[#1A4D2E] mb-2">
                Click to upload an image
              </p>
              <p className="text-sm text-stone-600">
                or drag and drop (PNG, JPG, WEBP)
              </p>
            </label>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]"
              data-testid="preview-section"
            >
              <img
                src={previewUrl}
                alt="Plant to identify"
                className="w-full h-96 object-cover"
              />
            </motion.div>

            {/* Action Buttons */}
            {!result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 justify-center"
              >
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="rounded-full px-8 py-6 border-[#1A4D2E] text-[#1A4D2E]"
                  data-testid="change-image-btn"
                >
                  Change Image
                </Button>
                <Button
                  onClick={handleIdentify}
                  disabled={identifying}
                  className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full px-8 py-6 text-lg"
                  data-testid="identify-btn"
                >
                  {identifying ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                      Identifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Identify Plant
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]"
                  data-testid="result-section"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#D9F99D] rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#1A4D2E]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-heading font-semibold text-[#1A4D2E]" data-testid="identified-plant-name">
                        {result.plant_name}
                      </h2>
                      {result.botanical_name && (
                        <p className="text-sm text-stone-600 italic" data-testid="identified-botanical-name">
                          {result.botanical_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      result.confidence === 'high' ? 'bg-[#D9F99D] text-[#1A4D2E]' :
                      result.confidence === 'medium' ? 'bg-[#F2CCB7] text-[#E07A5F]' :
                      'bg-stone-200 text-stone-700'
                    }`} data-testid="confidence-level">
                      {result.confidence} confidence
                    </span>
                  </div>

                  <div className="space-y-4" data-testid="care-instructions">
                    <h3 className="text-xl font-heading font-medium text-[#1A4D2E]">Care Instructions</h3>
                    
                    {result.care_instructions.sunlight && (
                      <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                        <p className="font-medium text-[#2C3329] mb-1">☀️ Sunlight</p>
                        <p className="text-sm text-stone-600">{result.care_instructions.sunlight}</p>
                      </div>
                    )}

                    {result.care_instructions.water && (
                      <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                        <p className="font-medium text-[#2C3329] mb-1">💧 Water</p>
                        <p className="text-sm text-stone-600">{result.care_instructions.water}</p>
                      </div>
                    )}

                    {result.care_instructions.soil && (
                      <div className="p-4 bg-[#F5F5F0] rounded-2xl">
                        <p className="font-medium text-[#2C3329] mb-1">🌱 Soil</p>
                        <p className="text-sm text-stone-600">{result.care_instructions.soil}</p>
                      </div>
                    )}

                    {result.care_instructions.tips && result.care_instructions.tips.length > 0 && (
                      <div className="p-4 bg-[#E8F5E9] rounded-2xl">
                        <p className="font-medium text-[#2C3329] mb-2">Tips</p>
                        <ul className="space-y-1">
                          {result.care_instructions.tips.map((tip, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-[#1A4D2E]">•</span>
                              <span className="text-sm text-stone-600">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-stone-200 flex gap-4">
                    <Button
                      onClick={handleReset}
                      className="flex-1 bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 rounded-full"
                      data-testid="identify-another-btn"
                    >
                      Identify Another Plant
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
