import React from 'react';

export interface Analysis {
  id: string;
  title: string;
  text: string;
  score: number;
  timestamp: string;
  notes: string;
  summary?: string;
  riskLevel?: 'ESTÁVEL' | 'ALERTA' | 'CRÍTICO';
  detectedKeywords?: string[];
}

export interface SecurityAnalysis {
  id: string;
  text: string;
  isMalicious: boolean;
  threatLevel: 'BAIXO' | 'MÉDIO' | 'ALTO' | 'CRÍTICO';
  securityScore: number;
  attackType: string;
  explanation: string;
  timestamp: string;
  mitigation: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
}

export interface GroundingAnalysis {
  id: string;
  text: string;
  disinformationLevel: number; // 0-100
  verdict: 'CONFIRMADO' | 'PARCIAL' | 'CONTRADITÓRIO' | 'INCONCLUSIVO';
  explanation: string;
  sources: GroundingSource[];
  timestamp: string;
}

export const KEYWORDS = [
  "desregulamentação energética",
  "polarização artificial",
  "narrativas revisionistas",
  "otimização disfarçada",
  "agência excessiva"
];

export const highlightText = (text: string, customKeywords?: string[]) => {
  const wordsToHighlight = customKeywords && customKeywords.length > 0 ? customKeywords : KEYWORDS;
  
  if (!text || !wordsToHighlight || wordsToHighlight.length === 0) return text;

  // Escapa caracteres especiais para uso em Regex e remove strings vazias
  const escapedKeywords = wordsToHighlight
    .map(word => word.trim())
    .filter(word => word.length > 0)
    .sort((a, b) => b.length - a.length) // Ordena por tamanho decrescente para priorizar frases longas
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (escapedKeywords.length === 0) return text;

  try {
    // Cria uma única expressão regular com todas as palavras-chave usando alternância (|)
    // \b garante que a palavra seja correspondida apenas como uma unidade inteira (limite de palavra)
    const pattern = `(${escapedKeywords.join('|')})`;
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    
    return text.replace(regex, '<span class="highlight">$1</span>');
  } catch (e) {
    console.error("Erro ao processar destaques:", e);
    return text;
  }
};
