import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Star, Filter, Search } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { Header } from '@/components/layout/Header';

interface Therapist {
    id: string;
    name: string;
    age: number;
    photo_url: string;
    bio: string;
    specialties: string[];
    experience_years: number;
    rating: number;
    total_sessions: number;
    price_per_session: number;
}

export default function TherapistMarketplace() {
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTherapists();
    }, [selectedSpecialty]);

    const loadTherapists = async () => {
        try {
            setLoading(true);
            const url = selectedSpecialty
                ? `${API_BASE_URL}/therapists?specialty=${selectedSpecialty}`
                : `${API_BASE_URL}/therapists`;

            console.log('🔍 [MARKETPLACE] Carregando terapeutas...', { url, selectedSpecialty });

            const response = await fetch(url);
            const data = await response.json();

            console.log('📦 [MARKETPLACE] Dados recebidos:', data);

            if (data.success) {
                setTherapists(data.therapists);
                console.log('✅ [MARKETPLACE] Terapeutas carregados:', data.therapists.length);
            }
        } catch (error) {
            console.error('❌ [MARKETPLACE] Erro ao carregar terapeutas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTherapists = therapists.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        Encontre seu Terapeuta Ideal
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-600 mb-8"
                    >
                        Profissionais qualificados prontos para te ajudar
                    </motion.p>

                    {/* Busca */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou especialidade..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-lg"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Filtros */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <button
                            onClick={() => setSelectedSpecialty('')}
                            className={`px-4 py-2 rounded-full transition-colors ${selectedSpecialty === ''
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Todas
                        </button>
                        {['Ansiedade', 'Depressão', 'Relacionamentos', 'Autoestima', 'Estresse'].map((spec) => (
                            <button
                                key={spec}
                                onClick={() => setSelectedSpecialty(spec)}
                                className={`px-4 py-2 rounded-full transition-colors ${selectedSpecialty === spec
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Terapeutas */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-600 mt-4">Carregando terapeutas...</p>
                    </div>
                ) : filteredTherapists.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum terapeuta encontrado</p>
                        <p className="text-sm text-gray-500 mt-2">Abra o console (F12) para ver logs de debug</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTherapists.map((therapist, index) => (
                            <motion.div
                                key={therapist.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Foto */}
                                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400">
                                    {therapist.photo_url ? (
                                        <img
                                            src={therapist.photo_url}
                                            alt={therapist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                                            {therapist.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                                        <span className="text-sm font-bold text-purple-600">
                                            R$ {therapist.price_per_session.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{therapist.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {therapist.age} anos • {therapist.experience_years} anos de experiência
                                    </p>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(therapist.rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {therapist.rating.toFixed(1)} ({therapist.total_sessions} sessões)
                                        </span>
                                    </div>

                                    {/* Especialidades */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {Array.isArray(therapist.specialties) && therapist.specialties.length > 0 ? (
                                            <>
                                                {therapist.specialties.slice(0, 3).map((spec, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full"
                                                    >
                                                        {spec}
                                                    </span>
                                                ))}
                                                {therapist.specialties.length > 3 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{therapist.specialties.length - 3}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-500">Sem especialidades</span>
                                        )}
                                    </div>

                                    {/* Bio */}
                                    <p className="text-sm text-gray-700 line-clamp-2 mb-4">{therapist.bio}</p>

                                    {/* Botão */}
                                    <Link
                                        to={`/therapists/${therapist.id}`}
                                        className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                                    >
                                        Ver Perfil
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
