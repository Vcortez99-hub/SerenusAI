// Removendo importação do lucide-react temporariamente para corrigir tela branca
// import { Heart, Brain, Users, Star, ArrowRight, Play, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">♥</span>
            </div>
            <span className="text-2xl font-bold text-gray-800 font-headings">EssentIA</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-gray-800 hover:text-blue-600 font-medium">
              Funcionalidades
            </a>
            <Link 
              to="/login"
              className="text-gray-800 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Entrar
            </Link>
            <Link 
              to="/onboarding"
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Começar Agora
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <span className="mr-2">✨</span>
                  Powered by AI • Cuidado Humano
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Sua jornada de 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    bem-estar emocional
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Combine inteligência artificial avançada com cuidado terapêutico personalizado.
                  Acompanhe seu humor, converse com nossa IA e evolua em sua jornada de saúde emocional.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/onboarding"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl group"
                >
                  Começar Gratuitamente
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group">
                  <span className="mr-2 group-hover:scale-110 transition-transform">▶</span>
                  Ver Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Suporte IA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">+500</div>
                  <div className="text-sm text-gray-600">Terapeutas</div>
                </div>
              </div>
            </div>

            {/* Right Content - Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">🧠</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">EssentIA AI</h3>
                      <p className="text-sm text-gray-600">Seu assistente de bem-estar</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-700">
                        "Como você está se sentindo hoje? Vamos conversar sobre o que está em sua mente."
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4 ml-8">
                      <p className="text-sm text-gray-700">
                        "Estou me sentindo um pouco ansioso com o trabalho..."
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-700">
                        "Entendo. Que tal tentarmos um exercício de respiração? Posso te guiar."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decorations */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades que transformam vidas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma combina tecnologia de ponta com abordagens terapêuticas comprovadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white text-xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">IA Terapêutica</h3>
              <p className="text-gray-600">
                Conversas inteligentes que se adaptam ao seu estado emocional e oferecem suporte personalizado 24/7.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white text-xl">💚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mood Tracking</h3>
              <p className="text-gray-600">
                Acompanhe seu humor diariamente e visualize padrões que ajudam a entender sua jornada emocional.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white text-xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Terapeutas Especialistas</h3>
              <p className="text-gray-600">
                Conecte-se com profissionais qualificados quando precisar de suporte humano especializado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar sua saúde emocional?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de pessoas que já descobriram o poder da terapia assistida por IA
          </p>
          <Link 
            to="/onboarding"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl group"
          >
            Começar Minha Jornada
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">♥</span>
            </div>
            <span className="text-2xl font-bold font-headings">EssentIA</span>
          </div>
          <p className="text-gray-400 mb-8">
            Sua jornada de bem-estar emocional, guiada por IA e cuidado humano
          </p>
          
          <h3 className="text-lg font-semibold mb-4">
            🚀 Explore todas as funcionalidades
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/chat" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Chat IA
            </Link>
            <Link to="/diary" className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Diário Digital
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}