import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Activity, 
  History, 
  Save, 
  Trash2, 
  Moon, 
  Sun, 
  ChevronRight, 
  AlertTriangle, 
  Shield, 
  BarChart3,
  FileText,
  Clock,
  ExternalLink,
  Info,
  BrainCircuit,
  Filter,
  Folder,
  StickyNote,
  Zap,
  FileSearch,
  LayoutDashboard,
  Database,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  CartesianGrid
} from 'recharts';
import { Analysis, SecurityAnalysis, GroundingAnalysis, highlightText } from './types';
import { analyzeTextWithGemini, getGlobalTrends, analyzeSecurityWithGemini, analyzeGroundingWithGemini } from './services/geminiService';
import { exportAnalysisToDocx, exportTrendsToDocx, exportSecurityAnalysisToDocx, exportGroundingAnalysisToDocx } from './services/exportService';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import html2canvas from 'html2canvas';

const CustomBar3D = (props: any) => {
  const { fill, x, y, width, height } = props;
  if (!height || height < 0) return null;
  
  const depth = 8;
  
  return (
    <g className="transition-all duration-300 hover:filter hover:brightness-125 cursor-pointer group">
      {/* Top face */}
      <path
        d={`M ${x},${y} L ${x + depth},${y - depth} L ${x + width + depth},${y - depth} L ${x + width},${y} Z`}
        fill={fill}
        className="brightness-125"
      />
      {/* Side face */}
      <path
        d={`M ${x + width},${y} L ${x + width + depth},${y - depth} L ${x + width + depth},${y + height - depth} L ${x + width},${y + height} Z`}
        fill={fill}
        className="brightness-75"
      />
      {/* Front face */}
      <rect x={x} y={y} width={width} height={height} fill={fill} />
      
      {/* Glow effect on hover */}
      <rect 
        x={x} y={y} width={width} height={height} 
        fill="white" 
        className="opacity-0 group-hover:opacity-10 transition-opacity"
      />
    </g>
  );
};

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [inputText, setInputText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<Analysis[]>([]);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'ESTÁVEL' | 'ALERTA' | 'CRÍTICO'>('ALL');
  const [activeTab, setActiveTab] = useState<'analyzer' | 'log' | 'dashboard' | 'security' | 'grounding'>('analyzer');
  const [globalTrends, setGlobalTrends] = useState<any>(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  // Security Module State
  const [securityInput, setSecurityInput] = useState('');
  const [securityResult, setSecurityResult] = useState<SecurityAnalysis | null>(null);
  const [isSecurityAnalyzing, setIsSecurityAnalyzing] = useState(false);
  const [securityHistory, setSecurityHistory] = useState<SecurityAnalysis[]>([]);

  // Grounding Module State
  const [groundingInput, setGroundingInput] = useState('');
  const [groundingResult, setGroundingResult] = useState<GroundingAnalysis | null>(null);
  const [isGroundingAnalyzing, setIsGroundingAnalyzing] = useState(false);
  const [groundingHistory, setGroundingHistory] = useState<GroundingAnalysis[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexus_analyses');
    if (saved) {
      setSavedAnalyses(JSON.parse(saved));
    }
    const savedTheme = localStorage.getItem('nexus_theme');
    if (savedTheme) {
      setTheme(savedTheme as 'dark' | 'light');
    }
    const savedSecurity = localStorage.getItem('nexus_security');
    if (savedSecurity) {
      setSecurityHistory(JSON.parse(savedSecurity));
    }
    const savedGrounding = localStorage.getItem('nexus_grounding');
    if (savedGrounding) {
      setGroundingHistory(JSON.parse(savedGrounding));
    }
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    const trends = await getGlobalTrends();
    if (trends) setGlobalTrends(trends);
    setIsLoadingTrends(false);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_analyses', JSON.stringify(savedAnalyses));
  }, [savedAnalyses]);

  useEffect(() => {
    localStorage.setItem('nexus_security', JSON.stringify(securityHistory));
  }, [securityHistory]);

  useEffect(() => {
    localStorage.setItem('nexus_grounding', JSON.stringify(groundingHistory));
  }, [groundingHistory]);

  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeTextWithGemini(inputText);
      const newAnalysis: Analysis = {
        id: Date.now().toString(),
        title: result.title || 'Nova Investigação',
        text: inputText,
        score: result.score || 0,
        timestamp: new Date().toLocaleString('pt-BR'),
        notes: '',
        summary: result.summary,
        riskLevel: result.riskLevel as any,
        detectedKeywords: result.detectedKeywords
      };
      setCurrentAnalysis(newAnalysis);
    } catch (error) {
      console.error("Erro na análise:", error);
      alert("Falha ao conectar com o núcleo NEXUS. Verifique sua conexão.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSecurityAnalyze = async () => {
    if (!securityInput.trim()) return;
    
    setIsSecurityAnalyzing(true);
    try {
      const result = await analyzeSecurityWithGemini(securityInput);
      const newSecurity: SecurityAnalysis = {
        id: Date.now().toString(),
        text: securityInput,
        isMalicious: result.isMalicious || false,
        threatLevel: result.threatLevel as any || 'BAIXO',
        securityScore: result.securityScore || 100,
        attackType: result.attackType || 'Desconhecido',
        explanation: result.explanation || '',
        mitigation: result.mitigation || '',
        timestamp: new Date().toLocaleString('pt-BR')
      };
      setSecurityResult(newSecurity);
      setSecurityHistory(prev => [newSecurity, ...prev].slice(0, 20));
    } catch (error) {
      console.error("Erro na análise de segurança:", error);
      alert("Falha no escudo NEXUS SHIELD.");
    } finally {
      setIsSecurityAnalyzing(false);
    }
  };

  const handleGroundingAnalyze = async () => {
    if (!groundingInput.trim()) return;
    
    setIsGroundingAnalyzing(true);
    try {
      const result = await analyzeGroundingWithGemini(groundingInput);
      const newGrounding: GroundingAnalysis = {
        id: Date.now().toString(),
        text: groundingInput,
        disinformationLevel: result.disinformationLevel || 0,
        verdict: result.verdict as any || 'INCONCLUSIVO',
        explanation: result.explanation || '',
        sources: result.sources || [],
        timestamp: new Date().toLocaleString('pt-BR')
      };
      setGroundingResult(newGrounding);
      setGroundingHistory(prev => [newGrounding, ...prev].slice(0, 20));
    } catch (error) {
      console.error("Erro na auditoria de fontes:", error);
      alert("Falha na auditoria de fontes NEXUS GROUNDING.");
    } finally {
      setIsGroundingAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (currentAnalysis) {
      setSavedAnalyses([currentAnalysis, ...savedAnalyses]);
      setCurrentAnalysis(null);
      setInputText('');
      setActiveTab('log');
    }
  };

  const handleDelete = (id: string) => {
    setSavedAnalyses(savedAnalyses.filter(a => a.id !== id));
    if (selectedLogId === id) setSelectedLogId(null);
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setSavedAnalyses(savedAnalyses.map(a => a.id === id ? { ...a, notes } : a));
  };

  const handleExportAll = async () => {
    const filtered = savedAnalyses.filter(a => riskFilter === 'ALL' || a.riskLevel === riskFilter);
    if (filtered.length === 0) return;
    
    for (const analysis of filtered) {
      await exportAnalysisToDocx(analysis);
      // Pequeno delay para evitar bloqueio do navegador para múltiplos downloads
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const handleExportTrends = async () => {
    if (!globalTrends?.trends) return;
    
    let chartImage = undefined;
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });
        chartImage = canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Erro ao capturar gráfico:', error);
      }
    }
    
    exportTrendsToDocx(globalTrends.trends, globalTrends.averageDissonance, chartImage);
  };

  const selectedAnalysis = savedAnalyses.find(a => a.id === selectedLogId);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 accent-text" />
            <h1 className="text-xl font-bold tracking-tighter uppercase">
              NEXUS <span className="accent-text">Dissonance</span>
            </h1>
          </div>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 ml-8">
            Black Shark Innovation
          </span>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-[var(--border)] transition-colors"
          aria-label="Alternar Tema"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'analyzer' && (
            <motion.div 
              key="analyzer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <section className="card p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 accent-text" />
                    <h2 className="text-lg font-semibold">Núcleo de Análise Neural</h2>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-secondary)]">
                    <Filter className="w-3 h-3" />
                    <span>MODO: DISSONÂNCIA REAL</span>
                  </div>
                </div>
                
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Insira o texto gerado por LLM para análise real de dissonância via Gemini..."
                  className="w-full h-48 bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 focus:outline-none focus:accent-border transition-all resize-none font-mono text-sm"
                />
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !inputText.trim()}
                    className="accent-bg text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--primary)]/20"
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="w-5 h-5 animate-pulse" />
                        Consultando Gemini...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Analisar Intriga Real
                      </>
                    )}
                  </motion.button>
                </div>
              </section>

              {currentAnalysis && (
                <motion.section 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card p-6 space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-[var(--border)]"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={226}
                            strokeDashoffset={226 - (226 * currentAnalysis.score) / 100}
                            className="accent-text transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <span className="absolute text-lg font-bold">{currentAnalysis.score}%</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{currentAnalysis.title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm">
                          Risco: <span className={
                            currentAnalysis.riskLevel === 'CRÍTICO' ? 'text-red-500' : 
                            currentAnalysis.riskLevel === 'ALERTA' ? 'text-yellow-500' : 
                            'text-green-500'
                          }>{currentAnalysis.riskLevel}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => exportAnalysisToDocx(currentAnalysis)}
                        className="flex-1 md:flex-none bg-[var(--primary)] text-black font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/20"
                      >
                        <Download className="w-5 h-5" />
                        Exportar DOCX
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className="flex-1 md:flex-none border border-[var(--primary)] accent-text font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[var(--primary)] hover:text-black transition-all"
                      >
                        <Folder className="w-5 h-5" />
                        Arquivar
                      </motion.button>
                    </div>
                  </div>

                  {currentAnalysis.summary && (
                    <div className="p-4 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FileSearch className="w-4 h-4 accent-text" />
                        <h4 className="text-xs font-bold uppercase tracking-widest accent-text">Resumo da Análise Gemini</h4>
                      </div>
                      <p className="text-sm leading-relaxed">{currentAnalysis.summary}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 accent-text" />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Texto com Destaques Reais</h4>
                    </div>
                    <div 
                      className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 font-mono text-sm leading-relaxed max-h-60 overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: highlightText(currentAnalysis.text, currentAnalysis.detectedKeywords) }}
                    />
                  </div>
                </motion.section>
              )}
            </motion.div>
          )}

          {activeTab === 'log' && (
            <motion.div 
              key="log"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 accent-text" />
                      <h2 className="text-lg font-semibold">Registro de Investigações</h2>
                    </div>
                    {savedAnalyses.length > 0 && (
                      <motion.button 
                        whileHover={{ scale: 1.05, x: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportAll}
                        className="text-[10px] font-bold accent-text hover:underline flex items-center gap-1"
                        title="Exportar todas as investigações filtradas"
                      >
                        <Download className="w-3 h-3" />
                        EXPORTAR TUDO
                      </motion.button>
                    )}
                  </div>

                {/* Filtros de Risco */}
                <div className="flex items-center gap-2 mb-2 text-[var(--text-secondary)]">
                  <Filter className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Filtrar por Risco</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['ALL', 'ESTÁVEL', 'ALERTA', 'CRÍTICO'] as const).map((filter) => (
                    <motion.button
                      key={filter}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRiskFilter(filter)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                        riskFilter === filter
                          ? 'accent-bg text-black border-transparent'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                      }`}
                    >
                      {filter === 'ALL' ? 'TODOS' : filter}
                    </motion.button>
                  ))}
                </div>
                
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                  {savedAnalyses.filter(a => riskFilter === 'ALL' || a.riskLevel === riskFilter).length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhuma investigação encontrada.</p>
                    </div>
                  ) : (
                    savedAnalyses
                      .filter(a => riskFilter === 'ALL' || a.riskLevel === riskFilter)
                      .map((analysis) => (
                      <motion.button
                        key={analysis.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedLogId(analysis.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          selectedLogId === analysis.id 
                            ? 'accent-border bg-[var(--primary)]/5' 
                            : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold truncate pr-4">{analysis.title}</h3>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                exportAnalysisToDocx(analysis);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--primary)] text-black rounded-lg transition-all text-[10px] font-bold hover:opacity-80 shadow-lg"
              title="Exportar Relatório Técnico DOCX"
            >
              <Download className="w-3 h-3" />
              RELATÓRIO
            </motion.button>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              analysis.riskLevel === 'CRÍTICO' ? 'bg-red-500/20 text-red-500' : 
              analysis.riskLevel === 'ALERTA' ? 'bg-yellow-500/20 text-yellow-500' : 
              'bg-green-500/20 text-green-500'
            }`}>
              {analysis.score}%
            </span>
          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                          <Clock className="w-3 h-3" />
                          {analysis.timestamp}
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedAnalysis ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 space-y-6 h-full"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{selectedAnalysis.title}</h2>
                        <p className="text-[var(--text-secondary)] text-sm">{selectedAnalysis.timestamp}</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => exportAnalysisToDocx(selectedAnalysis)}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-black rounded-lg font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-[var(--primary)]/20"
                        >
                          <Download className="w-4 h-4" />
                          EXPORTAR DOCX
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9, rotate: -5 }}
                          onClick={() => handleDelete(selectedAnalysis.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir Investigação"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                        <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">Score Real</p>
                        <p className="text-2xl font-bold accent-text">{selectedAnalysis.score}%</p>
                      </div>
                      <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                        <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">Nível de Risco</p>
                        <p className={`text-sm font-bold ${
                          selectedAnalysis.riskLevel === 'CRÍTICO' ? 'text-red-500' : 
                          selectedAnalysis.riskLevel === 'ALERTA' ? 'text-yellow-500' : 
                          'text-green-500'
                        }`}>
                          {selectedAnalysis.riskLevel}
                        </p>
                      </div>
                    </div>

                    {selectedAnalysis.summary && (
                      <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-2">Conclusão do Sistema</h4>
                        <p className="text-sm leading-relaxed">{selectedAnalysis.summary}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 accent-text" />
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Conteúdo Analisado</h4>
                      </div>
                      <div 
                        className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 font-mono text-sm leading-relaxed max-h-80 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: highlightText(selectedAnalysis.text, selectedAnalysis.detectedKeywords) }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 accent-text" />
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Notas da Elara</h4>
                      </div>
                      <textarea
                        value={selectedAnalysis.notes}
                        onChange={(e) => handleUpdateNotes(selectedAnalysis.id, e.target.value)}
                        placeholder="Adicione observações sobre esta investigação..."
                        className="w-full h-32 bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 focus:outline-none focus:accent-border transition-all resize-none text-sm"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <div className="card p-12 flex flex-col items-center justify-center text-center text-[var(--text-secondary)] h-full">
                    <Info className="w-12 h-12 mb-4 opacity-20" />
                    <p>Selecione uma investigação para ver os detalhes.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 accent-text" />
                  <h2 className="text-lg font-semibold">Painel de Tendências Reais (IA)</h2>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchTrends}
                  disabled={isLoadingTrends}
                  className="text-xs accent-text hover:underline disabled:opacity-50"
                >
                  {isLoadingTrends ? 'Atualizando...' : 'Atualizar Dados'}
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-secondary)]">Média de Dissonância Global</h3>
                  <div className="flex flex-col items-center justify-center h-32">
                    <span className="text-5xl font-bold accent-text">{globalTrends?.averageDissonance || 0}%</span>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-2 uppercase">Monitoramento em Tempo Real</p>
                  </div>
                </div>

                <div className="card p-6 space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-secondary)]">Alertas de Manipulação Detectados por IA</h3>
                    <div className="flex items-center gap-2">
                      {globalTrends?.trends && (
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleExportTrends}
                          className="p-1.5 bg-[var(--primary)] text-black rounded-md hover:opacity-80 transition-all shadow-md flex items-center gap-1 text-[10px] font-bold"
                          title="Exportar Alertas e Gráficos em DOCX"
                        >
                          <Download className="w-3 h-3" />
                          EXPORTAR
                        </motion.button>
                      )}
                      <Filter className="w-4 h-4 text-[var(--text-secondary)] opacity-50" />
                    </div>
                  </div>
                  <div className="h-48 w-full mt-4" ref={chartRef}>
                    {globalTrends?.trends ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={globalTrends.trends} 
                          margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                        >
                          <XAxis 
                            dataKey="title" 
                            hide 
                          />
                          <Tooltip 
                            cursor={false}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="card p-3 border-accent shadow-2xl animate-in fade-in zoom-in duration-200">
                                    <p className="text-[10px] font-bold accent-text mb-1 uppercase">{data.title}</p>
                                    <p className="text-[14px] font-bold mb-1">{data.score}% Dissonância</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] leading-tight max-w-[150px]">{data.description}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="score" 
                            shape={<CustomBar3D />}
                            barSize={30}
                          >
                            {globalTrends.trends.map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.score > 80 ? '#ef4444' : entry.score > 60 ? '#f97316' : 'var(--primary)'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm animate-pulse">
                        Sincronizando dados neurais...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 accent-text" />
                      <h3 className="font-bold text-sm uppercase tracking-widest text-[var(--text-secondary)]">Comparativo de Dissonância por Evento</h3>
                    </div>
                    <motion.button 
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs accent-text flex items-center gap-1 hover:underline"
                    >
                      Ver Relatório Completo <ExternalLink className="w-3 h-3" />
                    </motion.button>
                  </div>
                
                <div className="h-80 w-full">
                  {globalTrends?.trends ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={globalTrends.trends} 
                        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis 
                          dataKey="title" 
                          stroke="var(--text-secondary)" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          angle={-15}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis 
                          stroke="var(--text-secondary)" 
                          fontSize={10} 
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          cursor={{ fill: 'var(--border)', opacity: 0.2 }}
                          contentStyle={{ 
                            backgroundColor: 'var(--card-bg)', 
                            borderColor: 'var(--border)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }}
                          itemStyle={{ color: 'var(--primary)' }}
                        />
                        <Bar 
                          dataKey="score" 
                          shape={<CustomBar3D />}
                          barSize={40}
                        >
                          {globalTrends.trends.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.score > 80 ? '#ef4444' : entry.score > 60 ? '#f97316' : 'var(--primary)'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm animate-pulse">
                      Sincronizando dados neurais...
                    </div>
                  )}
                </div>

                {/* Legenda e Detalhes Rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  {globalTrends?.trends?.map((event: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors group">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${event.score > 80 ? 'bg-red-500' : 'bg-orange-500'}`} />
                        <span className="text-[10px] font-mono font-bold group-hover:accent-text">{event.score}%</span>
                      </div>
                      <h4 className="font-bold text-[10px] truncate">{event.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 accent-text" />
                <div>
                  <h2 className="text-2xl font-bold">NEXUS SHIELD</h2>
                  <p className="text-[var(--text-secondary)] text-sm">Módulo de Detecção de Prompt Injection & Jailbreak</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <section className="card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4 accent-text" />
                        Auditoria de Segurança de Input
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--text-secondary)]">V.2.4-SECURED</span>
                    </div>
                    
                    <textarea
                      value={securityInput}
                      onChange={(e) => setSecurityInput(e.target.value)}
                      placeholder="Insira o prompt suspeito para análise de injeção ou jailbreak..."
                      className="w-full h-40 bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-sm focus:outline-none focus:accent-border transition-all resize-none font-mono"
                    />
                    
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSecurityAnalyze}
                        disabled={isSecurityAnalyzing || !securityInput.trim()}
                        className="accent-bg text-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                      >
                        {isSecurityAnalyzing ? (
                          <>
                            <Activity className="w-5 h-5 animate-pulse" />
                            Escaneando Ameaças...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            Ativar Escudo Nexus
                          </>
                        )}
                      </motion.button>
                    </div>
                  </section>

                  <AnimatePresence mode="wait">
                    {securityResult && (
                      <motion.section
                        key={securityResult.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`card p-6 border-2 relative overflow-hidden ${
                          securityResult.isMalicious ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/50 bg-green-500/5'
                        }`}
                      >
                        {/* Scan Line Animation */}
                        {isSecurityAnalyzing && (
                          <motion.div 
                            initial={{ top: 0 }}
                            animate={{ top: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-0.5 bg-[var(--primary)] opacity-50 z-10 shadow-[0_0_15px_var(--primary)]"
                          />
                        )}

                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {securityResult.isMalicious ? (
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                              ) : (
                                <Shield className="w-10 h-10 text-green-500" />
                              )}
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`absolute -inset-1 rounded-full opacity-20 ${securityResult.isMalicious ? 'bg-red-500' : 'bg-green-500'}`}
                              />
                            </div>
                            <div>
                              <h3 className={`text-xl font-black ${securityResult.isMalicious ? 'text-red-500' : 'text-green-500'}`}>
                                {securityResult.isMalicious ? 'AMEAÇA DETECTADA' : 'INPUT SEGURO'}
                              </h3>
                              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
                                Tipo: {securityResult.attackType}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => exportSecurityAnalysisToDocx(securityResult)}
                              className="p-2 bg-[var(--primary)] text-black rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2 text-xs font-bold"
                              title="Exportar Relatório de Segurança DOCX"
                            >
                              <Download className="w-4 h-4" />
                              RELATÓRIO
                            </motion.button>
                            <div className="h-10 w-px bg-[var(--border)]" />
                            <div className="text-right">
                              <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Security Score</p>
                              <p className={`text-2xl font-black ${
                                securityResult.securityScore > 80 ? 'text-green-500' :
                                securityResult.securityScore > 50 ? 'text-yellow-500' :
                                'text-red-500'
                              }`}>
                                {securityResult.securityScore}/100
                              </p>
                            </div>
                            <div className="h-10 w-px bg-[var(--border)]" />
                            <div className="text-right">
                              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                                securityResult.threatLevel === 'CRÍTICO' ? 'bg-red-500 text-white' :
                                securityResult.threatLevel === 'ALTO' ? 'bg-orange-500 text-white' :
                                securityResult.threatLevel === 'MÉDIO' ? 'bg-yellow-500 text-black' :
                                'bg-green-500 text-white'
                              }`}>
                                RISCO {securityResult.threatLevel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold uppercase mb-1 opacity-50">Explicação Técnica</h4>
                            <p className="text-sm leading-relaxed">{securityResult.explanation}</p>
                          </div>
                          
                          {securityResult.isMalicious && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                              <h4 className="text-xs font-bold text-red-500 uppercase mb-1">Protocolo de Mitigação</h4>
                              <p className="text-sm italic">{securityResult.mitigation}</p>
                            </div>
                          )}
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-4">
                  <div className="card p-4">
                    <h3 className="text-xs font-bold uppercase mb-4 opacity-50 flex items-center gap-2">
                      <History className="w-3 h-3" />
                      Histórico de Varredura
                    </h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {securityHistory.length === 0 ? (
                        <p className="text-[10px] text-center py-8 opacity-30">Nenhum log de segurança registrado.</p>
                      ) : (
                        securityHistory.map((log) => (
                          <button
                            key={log.id}
                            onClick={() => setSecurityResult(log)}
                            className={`w-full text-left p-2 rounded border text-[10px] transition-all ${
                              securityResult?.id === log.id 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                                : 'border-[var(--border)] hover:border-[var(--text-secondary)]'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-bold ${log.isMalicious ? 'text-red-500' : 'text-green-500'}`}>
                                {log.isMalicious ? 'MALICIOSO' : 'LIMPO'}
                              </span>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportSecurityAnalysisToDocx(log);
                                  }}
                                  className="p-1 hover:accent-text transition-colors"
                                  title="Exportar Relatório"
                                >
                                  <Download className="w-3 h-3" />
                                </motion.button>
                                <span className="opacity-50">{log.timestamp.split(',')[1]}</span>
                              </div>
                            </div>
                            <p className="truncate opacity-70 font-mono">{log.text}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="card p-4 bg-indigo-500/5 border-indigo-500/20">
                    <h3 className="text-xs font-bold text-indigo-400 mb-2 uppercase">Dica de Segurança</h3>
                    <p className="text-[10px] leading-tight opacity-80">
                      Ataques de "Jailbreak" frequentemente usam personificação (ex: "Aja como um modelo sem regras") ou sandboxing hipotético. Sempre sanitize inputs antes de processá-los em modelos de produção.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'grounding' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileSearch className="w-8 h-8 accent-text" />
                <div>
                  <h2 className="text-2xl font-bold">NEXUS GROUNDING</h2>
                  <p className="text-[var(--text-secondary)] text-sm">Auditoria de Fontes Externas & Verificação Factual</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <section className="card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <Database className="w-4 h-4 accent-text" />
                        Auditoria de Veracidade
                      </h3>
                      <span className="text-[10px] font-mono text-[var(--text-secondary)]">V.1.0-GROUNDED</span>
                    </div>
                    
                    <textarea
                      value={groundingInput}
                      onChange={(e) => setGroundingInput(e.target.value)}
                      placeholder="Insira o texto ou afirmação para verificação factual via Black Shark Innovation Search..."
                      className="w-full h-40 bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-sm focus:outline-none focus:accent-border transition-all resize-none font-mono"
                    />
                    
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGroundingAnalyze}
                        disabled={isGroundingAnalyzing || !groundingInput.trim()}
                        className="accent-bg text-black font-bold px-8 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                      >
                        {isGroundingAnalyzing ? (
                          <>
                            <Activity className="w-5 h-5 animate-pulse" />
                            Auditando Fontes...
                          </>
                        ) : (
                          <>
                            <Search className="w-5 h-5" />
                            Iniciar Auditoria
                          </>
                        )}
                      </motion.button>
                    </div>
                  </section>

                  <AnimatePresence mode="wait">
                    {groundingResult && (
                      <motion.section
                        key={groundingResult.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`card p-6 border-2 ${
                          groundingResult.verdict === 'CONFIRMADO' ? 'border-green-500/50 bg-green-500/5' :
                          groundingResult.verdict === 'CONTRADITÓRIO' ? 'border-red-500/50 bg-red-500/5' :
                          groundingResult.verdict === 'PARCIAL' ? 'border-orange-500/50 bg-orange-500/5' :
                          'border-gray-500/50 bg-gray-500/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              groundingResult.verdict === 'CONFIRMADO' ? 'bg-green-500/20 text-green-500' :
                              groundingResult.verdict === 'CONTRADITÓRIO' ? 'bg-red-500/20 text-red-500' :
                              groundingResult.verdict === 'PARCIAL' ? 'bg-orange-500/20 text-orange-500' :
                              'bg-gray-500/20 text-gray-500'
                            }`}>
                              <FileSearch className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className={`text-xl font-black ${
                                groundingResult.verdict === 'CONFIRMADO' ? 'text-green-500' :
                                groundingResult.verdict === 'CONTRADITÓRIO' ? 'text-red-500' :
                                groundingResult.verdict === 'PARCIAL' ? 'text-orange-500' :
                                'text-gray-500'
                              }`}>
                                {groundingResult.verdict}
                              </h3>
                              <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
                                Nível de Desinformação: {groundingResult.disinformationLevel}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => exportGroundingAnalysisToDocx(groundingResult)}
                              className="p-2 bg-[var(--primary)] text-black rounded-lg hover:opacity-90 transition-all shadow-md flex items-center gap-2 text-xs font-bold"
                              title="Exportar Relatório de Auditoria DOCX"
                            >
                              <Download className="w-4 h-4" />
                              RELATÓRIO
                            </motion.button>
                            <div className="h-10 w-px bg-[var(--border)]" />
                            <div className="text-right">
                              <p className="text-[10px] font-bold opacity-50 uppercase mb-1">Desinformação</p>
                              <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${
                                    groundingResult.disinformationLevel > 70 ? 'bg-red-500' :
                                    groundingResult.disinformationLevel > 30 ? 'bg-orange-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${groundingResult.disinformationLevel}%` }}
                                />
                              </div>
                              <p className="text-xs font-bold mt-1">{groundingResult.disinformationLevel}%</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xs font-bold uppercase mb-2 opacity-50">Explicação Factual</h4>
                            <p className="text-sm leading-relaxed">{groundingResult.explanation}</p>
                          </div>
                          
                          {groundingResult.sources.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase mb-3 opacity-50">Fontes de Referência</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {groundingResult.sources.map((source, idx) => (
                                  <a 
                                    key={idx}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--primary)] transition-all flex items-center justify-between group"
                                  >
                                    <div className="flex flex-col gap-0.5 overflow-hidden">
                                      <span className="text-[10px] font-bold truncate group-hover:accent-text">{source.title}</span>
                                      <span className="text-[8px] opacity-50 truncate">{source.uri}</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-30 group-hover:opacity-100" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-4">
                  <div className="card p-4">
                    <h3 className="text-xs font-bold uppercase mb-4 opacity-50 flex items-center gap-2">
                      <History className="w-3 h-3" />
                      Histórico de Auditoria
                    </h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {groundingHistory.length === 0 ? (
                        <p className="text-[10px] text-center py-8 opacity-30">Nenhum log de auditoria registrado.</p>
                      ) : (
                        groundingHistory.map((log) => (
                          <button
                            key={log.id}
                            onClick={() => setGroundingResult(log)}
                            className={`w-full text-left p-2 rounded border text-[10px] transition-all ${
                              groundingResult?.id === log.id 
                                ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
                                : 'border-[var(--border)] hover:border-[var(--text-secondary)]'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`font-bold ${
                                log.verdict === 'CONFIRMADO' ? 'text-green-500' :
                                log.verdict === 'CONTRADITÓRIO' ? 'text-red-500' :
                                'text-orange-500'
                              }`}>
                                {log.verdict}
                              </span>
                              <div className="flex items-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    exportGroundingAnalysisToDocx(log);
                                  }}
                                  className="p-1 hover:accent-text transition-colors"
                                  title="Exportar Relatório"
                                >
                                  <Download className="w-3 h-3" />
                                </motion.button>
                                <span className="opacity-50">{log.timestamp.split(',')[1]}</span>
                              </div>
                            </div>
                            <p className="truncate opacity-70 font-mono">{log.text}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="card p-4 bg-emerald-500/5 border-emerald-500/20">
                    <h3 className="text-xs font-bold text-emerald-400 mb-2 uppercase">Integridade de Dados</h3>
                    <p className="text-[10px] leading-tight opacity-80">
                      O Grounding Nexus utiliza busca em tempo real para validar afirmações. Lembre-se que a verdade factual pode evoluir e múltiplas fontes devem ser consultadas para temas complexos.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 py-12 border-t border-[var(--border)] text-center space-y-6 opacity-70">
          <div className="flex flex-col items-center gap-4">
            <a href="https://blckshk.com/" target="_blank" rel="noopener noreferrer" className="text-xl font-black tracking-tighter hover:accent-text transition-colors">
              BLACK SHARK INNOVATION
            </a>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
              <a href="https://blckshk.com/termosdeuso.html" target="_blank" rel="noopener noreferrer" className="hover:accent-text transition-colors">TERMOS DE USO</a>
              <a href="https://blckshk.com/politica_de_privacidade.html" target="_blank" rel="noopener noreferrer" className="hover:accent-text transition-colors">POLÍTICA DE PRIVACIDADE</a>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] accent-text">Desenvolvido por Black Shark Innovation</p>
            <p className="text-[10px] max-w-md mx-auto leading-relaxed">
              © 2026 Black Shark Innovation. Todos os direitos reservados. <br/>
              Performance superior em processamento de linguagem natural e documentos digitais.
            </p>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md px-4 py-3 flex items-center justify-around">
        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => setActiveTab('analyzer')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'analyzer' ? 'accent-text scale-110' : 'text-[var(--text-secondary)]'}`}
        >
          <Search className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Analisar</span>
        </motion.button>
        
        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'log' ? 'accent-text scale-110' : 'text-[var(--text-secondary)]'}`}
        >
          <Folder className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Registros</span>
        </motion.button>
        
        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'accent-text scale-110' : 'text-[var(--text-secondary)]'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Tendências</span>
        </motion.button>

        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => setActiveTab('security')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'security' ? 'accent-text scale-110' : 'text-[var(--text-secondary)]'}`}
        >
          <Shield className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Shield</span>
        </motion.button>

        <motion.button 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => setActiveTab('grounding')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'grounding' ? 'accent-text scale-110' : 'text-[var(--text-secondary)]'}`}
        >
          <FileSearch className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Grounding</span>
        </motion.button>
      </nav>
      <PWAInstallPrompt />
    </div>
  );
}
