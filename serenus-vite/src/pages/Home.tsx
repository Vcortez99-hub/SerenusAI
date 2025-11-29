import { Link } from 'react-router-dom'
import { Heart, Brain, Users, ArrowRight, Play, Sparkles, Shield, MessageCircle, BarChart2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary-200/20 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary-200/20 blur-[120px] animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="relative z-50 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl px-6 py-3 shadow-lg shadow-neutral-200/20">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-2xl font-headings font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Essentia
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Funcionalidades
            </a>
            <a href="#testimonials" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Depoimentos
            </a>
            <a href="#pricing" className="text-neutral-600 hover:text-primary-600 font-medium transition-colors">
              Planos
            </a>
            <Link to="/therapist-register" className="text-purple-600 hover:text-purple-700 font-bold transition-colors">
              Sou Terapeuta
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-neutral-600 hover:text-primary-600 font-bold px-4 py-2 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/onboarding"
              className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg hover:shadow-neutral-900/20 flex items-center gap-2 group"
            >
              <span>Começar Agora</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-white border border-primary-100 rounded-full shadow-sm">
                  <Sparkles className="w-4 h-4 text-primary-500 mr-2" />
                  <span className="text-sm font-bold text-primary-700">Powered by AI • Cuidado Humano</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-headings font-bold text-neutral-900 leading-[1.1]">
                  Sua jornada de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                    bem-estar emocional
                  </span>
                </h1>

                <p className="text-xl text-neutral-600 leading-relaxed max-w-lg">
                  Combine inteligência artificial avançada com cuidado terapêutico personalizado.
                  Acompanhe seu humor, converse com nossa IA e evolua em sua jornada.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/onboarding"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-primary-500/25 transition-all duration-300 group"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button className="inline-flex items-center justify-center px-8 py-4 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-300 group shadow-sm">
                  <Play className="mr-2 w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                  Ver Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-neutral-200">
                <div>
                  <div className="text-3xl font-headings font-bold text-neutral-900">98%</div>
                  <div className="text-sm font-medium text-neutral-500">Satisfação</div>
                </div>
                <div>
                  <div className="text-3xl font-headings font-bold text-neutral-900">24/7</div>
                  <div className="text-sm font-medium text-neutral-500">Suporte IA</div>
                </div>
                <div>
                  <div className="text-3xl font-headings font-bold text-neutral-900">+500</div>
                  <div className="text-sm font-medium text-neutral-500">Terapeutas</div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-neutral-200/50 p-8 border border-white/50 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <Brain className="text-white w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-headings font-bold text-xl text-neutral-900">EssentIA AI</h3>
                      <p className="text-sm text-neutral-500 font-medium">Seu assistente de bem-estar</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 rounded-tl-none">
                      <p className="text-neutral-700 font-medium">
                        "Como você está se sentindo hoje? Vamos conversar sobre o que está em sua mente."
                      </p>
                    </div>

                    <div className="bg-primary-50 rounded-2xl p-5 shadow-sm border border-primary-100 rounded-tr-none ml-12">
                      <p className="text-primary-900 font-medium">
                        "Estou me sentindo um pouco ansioso com o trabalho..."
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 rounded-tl-none">
                      <p className="text-neutral-700 font-medium">
                        "Entendo perfeitamente. A ansiedade no trabalho é comum. Que tal tentarmos um exercício rápido de respiração juntos?"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <div className="h-10 flex-1 bg-neutral-100 rounded-xl animate-pulse" />
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-8 bg-white p-4 rounded-2xl shadow-xl shadow-neutral-200/50 border border-white/50 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-bold uppercase">Humor</div>
                  <div className="text-sm font-bold text-neutral-900">Excelente</div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl shadow-neutral-200/50 border border-white/50 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-neutral-500 font-bold uppercase">Privacidade</div>
                  <div className="text-sm font-bold text-neutral-900">100% Seguro</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-headings font-bold text-neutral-900 mb-6">
              Funcionalidades que <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">transformam vidas</span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-3xl mx-auto">
              Nossa plataforma combina tecnologia de ponta com abordagens terapêuticas comprovadas para o seu bem-estar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-3xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-headings font-bold text-neutral-900 mb-4">IA Terapêutica</h3>
              <p className="text-neutral-600 leading-relaxed">
                Conversas inteligentes que se adaptam ao seu estado emocional e oferecem suporte personalizado 24/7, sempre que você precisar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-3xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300">
              <div className="w-14 h-14 bg-secondary-100 rounded-2xl flex items-center justify-center mb-6 text-secondary-600 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-headings font-bold text-neutral-900 mb-4">Mood Tracking</h3>
              <p className="text-neutral-600 leading-relaxed">
                Acompanhe seu humor diariamente com gráficos intuitivos e visualize padrões que ajudam a entender melhor sua jornada emocional.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-3xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-headings font-bold text-neutral-900 mb-4">Terapeutas Especialistas</h3>
              <p className="text-neutral-600 leading-relaxed">
                Conecte-se facilmente com profissionais qualificados quando sentir necessidade de um suporte humano mais aprofundado e especializado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-headings font-bold text-neutral-900 mb-6">
              Invista no seu <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">bem-estar</span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-3xl mx-auto">
              Escolha o plano ideal para sua jornada de autoconhecimento e evolução pessoal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200 shadow-xl hover:shadow-2xl hover:border-primary-200 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-headings font-bold text-neutral-900 mb-2">
                  Plano Básico
                </h3>
                <p className="text-neutral-500 mb-6">
                  Perfeito para começar sua jornada
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-neutral-900 tracking-tight">
                    R$ 29,90
                  </span>
                  <span className="text-neutral-500 ml-2 font-medium">
                    /mês
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Análise de sentimentos via WhatsApp',
                  'Diário digital personalizado',
                  'Relatórios mensais de humor',
                  'Suporte por email',
                  'Backup automático dos dados'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-neutral-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/onboarding"
                className="block w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-center transition-all duration-300"
              >
                Começar Agora
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="relative bg-white rounded-3xl p-8 border border-primary-500 shadow-2xl shadow-primary-500/10 scale-105 z-10">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 fill-current" />
                  Mais Popular
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-headings font-bold text-neutral-900 mb-2">
                  Plano Premium
                </h3>
                <p className="text-neutral-500 mb-6">
                  Para quem busca o máximo em evolução
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-neutral-900 tracking-tight">
                    R$ 49,90
                  </span>
                  <span className="text-neutral-500 ml-2 font-medium">
                    /mês
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Tudo do Plano Básico',
                  'Análise avançada com IA',
                  'Insights personalizados diários',
                  'Relatórios semanais detalhados',
                  'Suporte prioritário 24/7',
                  'Sessões de coaching virtual'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-neutral-600 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/onboarding"
                className="block w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-bold text-center shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
              >
                Assinar Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-secondary-900/50" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl font-headings font-bold text-white mb-8">
            Pronto para transformar sua <br /> saúde emocional?
          </h2>
          <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já descobriram o poder da terapia assistida por IA combinada com cuidado humano.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center px-10 py-5 bg-white text-neutral-900 font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-2xl hover:shadow-white/20 group text-lg"
          >
            Começar Minha Jornada
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Therapist CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm font-bold">Para Profissionais</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-headings font-bold mb-6">
                Você é Terapeuta?
                <br />
                Junte-se a nós!
              </h2>

              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Conecte-se com pessoas que precisam de ajuda profissional. Gerencie suas sessões,
                construa sua reputação e faça a diferença na vida de centenas de pessoas.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white/90">Plataforma completa de gestão</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white/90">Pagamentos facilitados (R$ 49,90/sessão)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-white/90">Alcance centenas de novos pacientes</span>
                </div>
              </div>

              <Link
                to="/therapist-register"
                className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-neutral-50 transition-all shadow-xl hover:shadow-2xl group"
              >
                Cadastrar como Terapeuta
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">+500</div>
                      <div className="text-white/80">Terapeutas Ativos</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">10k+</div>
                      <div className="text-white/80">Sessões Realizadas</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">4.9/5</div>
                      <div className="text-white/80">Avaliação Média</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="text-xl font-headings font-bold text-neutral-900">Essentia</span>
              </div>
              <p className="text-neutral-500 max-w-sm">
                Sua plataforma completa de bem-estar emocional, combinando a precisão da IA com o calor do cuidado humano.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Plataforma</h4>
              <ul className="space-y-3 text-neutral-500">
                <li><Link to="/login" className="hover:text-primary-600 transition-colors">Entrar</Link></li>
                <li><Link to="/onboarding" className="hover:text-primary-600 transition-colors">Criar Conta</Link></li>
                <li><a href="#features" className="hover:text-primary-600 transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-primary-600 transition-colors">Planos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-neutral-500">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-8 text-center text-neutral-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Essentia. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}