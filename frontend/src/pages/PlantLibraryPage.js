import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Search, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PlantLibraryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    filterPlants();
  }, [plants, searchTerm, categoryFilter, difficultyFilter]);

  const fetchPlants = async () => {
    try {
      const response = await axios.get(`${API}/plants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlants(response.data);
    } catch (error) {
      console.error('Failed to fetch plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlants = () => {
    let filtered = plants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.botanical_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(plant => plant.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(plant => plant.difficulty === difficultyFilter);
    }

    setFilteredPlants(filtered);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <header className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-[#1A4D2E] hover:bg-[#F5F5F0] rounded-full"
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-[#1A4D2E]" />
            <span className="text-2xl font-heading font-semibold text-[#1A4D2E]">Plant Library</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-[#F5F5F0] border-none focus:ring-0 rounded-full px-6 py-4"
                  data-testid="plant-search-input"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-full" data-testid="category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Vegetable">Vegetables</SelectItem>
                  <SelectItem value="Fruit">Fruits</SelectItem>
                  <SelectItem value="Herb">Herbs</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="rounded-full" data-testid="difficulty-filter">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Plants Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-stone-600">Loading plants...</p>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-stone-600">No plants found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="plants-grid">
            {filteredPlants.map((plant, index) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/plants/${plant.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(26,77,46,0.08)] hover:shadow-[0_10px_40px_-10px_rgba(26,77,46,0.15)] cursor-pointer group border border-stone-100"
                data-testid={`plant-card-${index}`}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={plant.image_url}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-110"
                    style={{ transition: 'transform 0.3s' }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-heading font-medium text-[#1A4D2E]">{plant.name}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      plant.difficulty === 'Easy' ? 'bg-[#D9F99D] text-[#1A4D2E]' :
                      plant.difficulty === 'Medium' ? 'bg-[#F2CCB7] text-[#E07A5F]' :
                      'bg-stone-200 text-stone-700'
                    }`}>
                      {plant.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mb-4 italic">{plant.botanical_name}</p>
                  <p className="text-sm text-stone-600 line-clamp-2">{plant.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs px-3 py-1 bg-[#F5F5F0] text-stone-700 rounded-full">
                      ☀️ {plant.sunlight}
                    </span>
                    <span className="text-xs px-3 py-1 bg-[#F5F5F0] text-stone-700 rounded-full">
                      💧 {plant.water}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
