import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

const SPECIALTIES = [
    'Ansiedade',
    'Depressão',
    'Relacionamentos',
    'Autoestima',
    'Estresse',
    'Luto',
    'Trauma',
    'Terapia de Casal',
    'Terapia Familiar',
    'Burnout',
    'Transtornos Alimentares',
    'TOC',
    'Fobias'
];

export default function TherapistRegister() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        age: '',
        bio: '',
        specialties: [] as string[],
        credentials: '',
        experience_years: ''
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleSpecialty = (specialty: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter(s => s !== specialty)
                : [...prev.specialties, specialty]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validações
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (formData.bio.length < 50) {
            setError('A biografia deve ter pelo menos 50 caracteres');
            return;
        }

        if (formData.specialties.length === 0) {
            setError('Selecione pelo menos uma especialidade');
            return;
        }

        if (formData.credentials.length < 5) {
            setError('Informe suas credenciais (ex: CRP, formação)');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/therapists/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    age: parseInt(formData.age),
                    bio: formData.bio,
                    specialties: formData.specialties,
                    credentials: formData.credentials,
                    experience_years: parseInt(formData.experience_years)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao cadastrar');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/therapist-login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erro ao cadastrar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h2>
                    <p className="text-gray-600 mb-4">
                        Seu cadastro foi enviado para aprovação. Você receberá um email quando for aprovado pelo administrador.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecionando para o login...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Voltar para Home
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">Cadastro de Terapeuta</h1>
                                <p className="text-purple-100">Junte-se à nossa rede de profissionais</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Foto */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                Foto de Perfil
                            </label>
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-4 border-purple-200">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <label
                                        htmlFor="photo-upload"
                                        className="btn-secondary cursor-pointer inline-block"
                                    >
                                        Escolher Foto
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF (máx. 5MB)</p>
                                </div>
                            </div>
                        </div>

                        {/* Dados Pessoais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    placeholder="Dr(a). Seu Nome"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Senha *
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Confirmar Senha *
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-field"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Telefone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Idade *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="input-field"
                                    placeholder="30"
                                    min="18"
                                    max="100"
                                />
                            </div>
                        </div>

                        {/* Biografia */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Biografia Profissional * (mínimo 50 caracteres)
                            </label>
                            <textarea
                                required
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="input-field min-h-[120px]"
                                placeholder="Conte sobre sua experiência, abordagem terapêutica e como você pode ajudar seus pacientes..."
                                minLength={50}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.bio.length}/50 caracteres
                            </p>
                        </div>

                        {/* Especialidades */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                Especialidades * (selecione pelo menos uma)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SPECIALTIES.map((specialty) => (
                                    <button
                                        key={specialty}
                                        type="button"
                                        onClick={() => toggleSpecialty(specialty)}
                                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.specialties.includes(specialty)
                                            ? 'bg-purple-50 border-purple-500 text-purple-700'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                                            }`}
                                    >
                                        {specialty}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Credenciais */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Credenciais * (CRP, formação, etc)
                            </label>
                            <textarea
                                required
                                value={formData.credentials}
                                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                                className="input-field min-h-[80px]"
                                placeholder="CRP 00/00000, Psicólogo(a) formado(a) pela..."
                            />
                        </div>

                        {/* Anos de Experiência */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Anos de Experiência *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.experience_years}
                                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                                className="input-field"
                                placeholder="5"
                                min="0"
                                max="60"
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex gap-4 pt-4">
                            <Link to="/" className="btn-secondary flex-1 text-center">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>

                        <p className="text-center text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <Link to="/therapist-login" className="text-purple-600 font-semibold hover:underline">
                                Fazer login
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
