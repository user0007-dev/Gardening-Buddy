import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Droplets, Sprout, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const fetchPlant = async () => {
    try {
      const response = await axios.get(`${API}/plants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlant(response.data);
    } catch (error) {
      console.error('Failed to fetch plant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <p className="text-lg text-stone-600">Loading plant details...</p>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <div className="text-center">
          <p className="text-lg text-stone-600 mb-4">Plant not found</p>
          <Button onClick={() => navigate('/plants')} className="rounded-full">
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/plants')}
            className="text-[#1A4D2E] hover:bg-[#F5F5F0] rounded-full"
            data-testid="back-to-library-btn"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Library
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] h-[500px]"
          >
            <img
              src={plant.image_url}
              alt={plant.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-sm px-4 py-2 rounded-full font-medium ${
                plant.difficulty === 'Easy' ? 'bg-[#D9F99D] text-[#1A4D2E]' :
                plant.difficulty === 'Medium' ? 'bg-[#F2CCB7] text-[#E07A5F]' :
                'bg-stone-200 text-stone-700'
              }`} data-testid="plant-difficulty">
                {plant.difficulty}
              </span>
              <span className="text-sm px-4 py-2 rounded-full bg-[#E8F5E9] text-[#1A4D2E] font-medium" data-testid="plant-category">
                {plant.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-heading tracking-tight text-[#1A4D2E] mb-2" data-testid="plant-name">
              {plant.name}
            </h1>
            <p className="text-lg text-stone-600 italic mb-6" data-testid="plant-botanical-name">{plant.botanical_name}</p>
            <p className="text-base text-stone-700 leading-relaxed mb-8" data-testid="plant-description">
              {plant.description}
            </p>

            {/* Care Requirements */}
            <div className="space-y-4 mb-8">
              <h2 className="text-2xl font-heading text-[#1A4D2E] mb-4">Care Requirements</h2>
              
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-stone-100">
                <Sun className="w-6 h-6 text-[#E07A5F] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#2C3329]">Sunlight</p>
                  <p className="text-sm text-stone-600" data-testid="plant-sunlight">{plant.sunlight}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-stone-100">
                <Droplets className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#2C3329]">Water</p>
                  <p className="text-sm text-stone-600" data-testid="plant-water">{plant.water}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-stone-100">
                <Sprout className="w-6 h-6 text-[#1A4D2E] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#2C3329]">Soil</p>
                  <p className="text-sm text-stone-600" data-testid="plant-soil">{plant.soil}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-stone-100">
                <Clock className="w-6 h-6 text-[#E07A5F] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#2C3329]">Growing Time</p>
                  <p className="text-sm text-stone-600" data-testid="plant-growing-time">{plant.growing_time}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-stone-100">
                <Calendar className="w-6 h-6 text-[#4CAF50] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-[#2C3329]">Harvest Season</p>
                  <p className="text-sm text-stone-600" data-testid="plant-harvest-season">{plant.harvest_season}</p>
                </div>
              </div>
            </div>

            {/* Care Tips */}
            <div className="bg-[#E8F5E9] rounded-3xl p-6">
              <h3 className="text-xl font-heading font-medium text-[#1A4D2E] mb-4">Care Tips</h3>
              <ul className="space-y-2" data-testid="plant-care-tips">
                {plant.care_tips.map((tip, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-[#1A4D2E] flex-shrink-0">•</span>
                    <span className="text-sm text-stone-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
