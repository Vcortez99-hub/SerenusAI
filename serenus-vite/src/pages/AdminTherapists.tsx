import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

// Especialidades predefinidas
const SPECIALTIES = [
    'Ansiedade',
    'Depressão',
    'Estresse',
    'TCC (Terapia Cognitivo-Comportamental)',
    'Psicanálise',
    'Terapia de Casal',
    'Terapia Familiar',
    'Transtornos Alimentares',
    'TOC (Transtorno Obsessivo-Compulsivo)',
    'TDAH',
    'Burnout',
    'Luto',
    'Autoestima',
    'Relacionamentos',
    'Trauma',
    'Dependência Química'
];

interface Therapist {
    id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
    photo_url: string;
    bio: string;
    specialties: string[];
    credentials: string;
    experience_years: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    rejection_reason?: string;
}

export default function AdminTherapists() {
    const { user } = useAuth();
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all'); // MUDADO PARA 'all'
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        bio: '',
        credentials: '',
        experience_years: ''
    });

    useEffect(() => {
        loadTherapists();
    }, [activeTab]);

    const loadTherapists = async () => {
        try {
            setLoading(true);
            const status = activeTab === 'all' ? '' : activeTab;
            const url = `${API_BASE_URL}/admin/therapists${status ? `?status=${status}` : ''}`;

            console.log('🔍 [FRONTEND] Carregando terapeutas...', { url, activeTab, status });

            const response = await fetch(url);

            console.log('📡 [FRONTEND] Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log('📦 [FRONTEND] Dados recebidos:', data);
            console.log('   Total de terapeutas:', data.therapists?.length || 0);
            if (data.therapists && data.therapists.length > 0) {
                console.log('   Primeiro terapeuta (raw):', data.therapists[0]);
            }

            if (data.success && data.therapists) {
                // Parse specialties de JSON string para array
                const therapistsWithParsedSpecialties = data.therapists.map((therapist: any, index: number) => {
                    try {
                        const parsed = {
                            ...therapist,
                            specialties: typeof therapist.specialties === 'string'
                                ? JSON.parse(therapist.specialties)
                                : Array.isArray(therapist.specialties)
                                    ? therapist.specialties
                                    : []
                        };
                        if (index === 0) {
                            console.log('   Primeiro terapeuta (parsed):', parsed);
                        }
                        return parsed;
                    } catch (parseError) {
                        console.error('❌ [FRONTEND] Erro ao fazer parse de specialties:', parseError, therapist);
                        return {
                            ...therapist,
                            specialties: []
                        };
                    }
                });

                console.log('✅ [FRONTEND] Terapeutas processados:', therapistsWithParsedSpecialties.length);
                console.log('   Setando state com:', therapistsWithParsedSpecialties);
                setTherapists(therapistsWithParsedSpecialties);
            } else {
                console.warn('⚠️ [FRONTEND] Resposta sem sucesso ou sem terapeutas:', data);
                setTherapists([]);
            }
        } catch (error) {
            console.error('❌ [FRONTEND] Erro ao carregar terapeutas:', error);
            alert(`Erro ao carregar terapeutas: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Verifique o console.`);
            setTherapists([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Aprovar este terapeuta?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/therapists/${id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: user?.id })
            });

            const data = await response.json();

            if (data.success) {
                alert('Terapeuta aprovado com sucesso!');
                loadTherapists();
            }
        } catch (error) {
            console.error('Erro ao aprovar:', error);
            alert('Erro ao aprovar terapeuta');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Motivo da reprovação:');
        if (!reason) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/therapists/${id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (data.success) {
                alert('Terapeuta reprovado');
                loadTherapists();
            }
        } catch (error) {
            console.error('Erro ao reprovar:', error);
            alert('Erro ao reprovar terapeuta');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este terapeuta permanentemente?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/therapists/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Terapeuta excluído');
                loadTherapists();
            }
        } catch (error: any) {
            alert(error.message || 'Erro ao excluir');
        }
    };

    const handleCreate = async () => {
        if (selectedSpecialties.length === 0) {
            alert('Selecione pelo menos uma especialidade');
            return;
        }

        try {
            console.log('🔵 [FRONTEND] Enviando cadastro de terapeuta...', {
                ...createForm,
                specialties: selectedSpecialties,
                adminUserId: user?.id
            });

            const response = await fetch(`${API_BASE_URL}/admin/therapists/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...createForm,
                    age: parseInt(createForm.age) || null,
                    experience_years: parseInt(createForm.experience_years) || 0,
                    specialties: selectedSpecialties,
                    adminUserId: user?.id
                })
            });

            const data = await response.json();
            console.log('📡 [FRONTEND] Resposta do cadastro:', data);

            if (data.success) {
                alert('Terapeuta cadastrado e aprovado com sucesso!');
                setShowCreateModal(false);
                setSelectedSpecialties([]);
                setCreateForm({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    age: '',
                    bio: '',
                    credentials: '',
                    experience_years: ''
                });
                console.log('🔄 [FRONTEND] Recarregando lista de terapeutas...');
                await loadTherapists();
            } else {
                alert(data.error || 'Erro ao cadastrar terapeuta');
            }
        } catch (error) {
            console.error('❌ [FRONTEND] Erro ao cadastrar:', error);
            alert('Erro ao cadastrar terapeuta');
        }
    };

    const pendingCount = therapists.filter(t => t.status === 'pending').length;

    console.log('🎨 [FRONTEND] Renderizando AdminTherapists', {
        loading,
        therapistsCount: therapists.length,
        activeTab,
        pendingCount
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Consistente */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/admin"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Gestão de Terapeutas</h1>
                            <p className="text-sm text-gray-600">Aprovar, reprovar e cadastrar terapeutas</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg"
                    >
                        + Cadastrar Terapeuta
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex border-b border-gray-200">
                        {[
                            { key: 'pending', label: 'Pendentes', count: pendingCount },
                            { key: 'approved', label: 'Aprovados' },
                            { key: 'rejected', label: 'Reprovados' },
                            { key: 'all', label: 'Todos' }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    console.log('🔘 [FRONTEND] Mudando tab para:', tab.key);
                                    setActiveTab(tab.key as any);
                                }}
                                className={`flex-1 px-6 py-4 font-medium transition-colors relative ${activeTab === tab.key
                                    ? 'text-purple-600 border-b-2 border-purple-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lista de Terapeutas */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-600 mt-4">Carregando...</p>
                    </div>
                ) : therapists.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Nenhum terapeuta encontrado</p>
                        <p className="text-sm text-gray-500">Abra o console (F12) para ver logs de debug</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {therapists.map((therapist) => (
                            <motion.div
                                key={therapist.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex gap-6">
                                    {/* Foto */}
                                    <div className="flex-shrink-0">
                                        <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                                            {therapist.photo_url ? (
                                                <img src={therapist.photo_url} alt={therapist.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                                    {therapist.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{therapist.name}</h3>
                                                <p className="text-sm text-gray-600">{therapist.age} anos • {therapist.experience_years} anos de experiência</p>
                                                <p className="text-sm text-gray-500">{therapist.email}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${therapist.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                therapist.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {therapist.status === 'approved' ? 'Aprovado' :
                                                    therapist.status === 'rejected' ? 'Reprovado' :
                                                        'Pendente'}
                                            </span>
                                        </div>

                                        {/* Especialidades */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {therapist.specialties && therapist.specialties.length > 0 ? (
                                                therapist.specialties.map((spec, idx) => (
                                                    <span key={idx} className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full">
                                                        {spec}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-500">Sem especialidades</span>
                                            )}
                                        </div>

                                        {/* Bio */}
                                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{therapist.bio}</p>

                                        {/* Credenciais */}
                                        <p className="text-xs text-gray-600 mb-4">
                                            <strong>Credenciais:</strong> {therapist.credentials}
                                        </p>

                                        {therapist.rejection_reason && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-red-800">
                                                    <strong>Motivo da reprovação:</strong> {therapist.rejection_reason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Ações */}
                                        <div className="flex gap-3">
                                            {therapist.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(therapist.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Aprovar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(therapist.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Reprovar
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setSelectedTherapist(therapist)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver Detalhes
                                            </button>
                                            <button
                                                onClick={() => handleDelete(therapist.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Cadastro */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold">Cadastrar Novo Terapeuta</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                    <input
                                        type="text"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                                    <input
                                        type="password"
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                    <input
                                        type="tel"
                                        value={createForm.phone}
                                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                                    <input
                                        type="number"
                                        value={createForm.age}
                                        onChange={(e) => setCreateForm({ ...createForm, age: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Anos de Experiência</label>
                                    <input
                                        type="number"
                                        value={createForm.experience_years}
                                        onChange={(e) => setCreateForm({ ...createForm, experience_years: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Biografia *</label>
                                <textarea
                                    value={createForm.bio}
                                    onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Especialidades * (selecione pelo menos uma)</label>
                                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    {SPECIALTIES.map((specialty) => (
                                        <label key={specialty} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedSpecialties.includes(specialty)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedSpecialties([...selectedSpecialties, specialty]);
                                                    } else {
                                                        setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
                                                    }
                                                }}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            />
                                            <span className="text-sm text-gray-700">{specialty}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedSpecialties.length > 0 && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selecionadas: {selectedSpecialties.length}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Credenciais * (CRP, etc)</label>
                                <input
                                    type="text"
                                    value={createForm.credentials}
                                    onChange={(e) => setCreateForm({ ...createForm, credentials: e.target.value })}
                                    placeholder="Ex: CRP 06/123456"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                >
                                    Cadastrar e Aprovar
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal de Detalhes */}
            {selectedTherapist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold">Detalhes do Terapeuta</h2>
                            <button
                                onClick={() => setSelectedTherapist(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <strong className="text-gray-700">Nome:</strong>
                                <p>{selectedTherapist.name}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Email:</strong>
                                <p>{selectedTherapist.email}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Telefone:</strong>
                                <p>{selectedTherapist.phone || 'Não informado'}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Biografia:</strong>
                                <p className="text-gray-600">{selectedTherapist.bio}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Credenciais:</strong>
                                <p className="text-gray-600">{selectedTherapist.credentials}</p>
                            </div>
                            <div>
                                <strong className="text-gray-700">Cadastrado em:</strong>
                                <p>{new Date(selectedTherapist.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
