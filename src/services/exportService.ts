import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  ImageRun
} from 'docx';
import { saveAs } from 'file-saver';
import { Analysis, SecurityAnalysis, GroundingAnalysis } from '../types';

export const exportTrendsToDocx = async (trends: any[], averageDissonance: number, chartImage?: string) => {
  const children: any[] = [
    // Header
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "NEXUS GLOBAL MONITORING | DASHBOARD DE TENDÊNCIAS",
          bold: true,
          size: 18,
          color: "666666",
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 800 } }),

    // Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "RELATÓRIO DE TENDÊNCIAS DE DISSONÂNCIA GLOBAL",
          bold: true,
          size: 40,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [
        new TextRun({
          text: `MÉDIA GLOBAL DE DISSONÂNCIA: ${averageDissonance}%`,
          bold: true,
          size: 24,
          color: averageDissonance > 50 ? "CC0000" : "000000",
        }),
      ],
    }),

    // Intro
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: "1. PANORAMA DE MANIPULAÇÃO", bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Este documento detalha os alertas de manipulação semântica e dissonância cognitiva detectados em tempo real pela rede neural Nexus. Os dados abaixo representam as tendências mais significativas observadas nos fluxos de dados auditados.",
          size: 22,
        }),
      ],
    }),
  ];

  // Add Chart Image if provided
  if (chartImage) {
    const base64Data = chartImage.split(',')[1];
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: "2. VISUALIZAÇÃO DE DADOS (IA)", bold: true, size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: bytes,
            transformation: {
              width: 500,
              height: 300,
            },
          } as any),
        ],
      }),
      new Paragraph({ spacing: { after: 400 } })
    );
  }

  children.push(
    // Trends Table
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: chartImage ? "3. ALERTAS DETECTADOS" : "2. ALERTAS DETECTADOS", bold: true, size: 28 })],
    }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [2700, 1350, 4950],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "333333" },
              children: [new Paragraph({ children: [new TextRun({ text: "TENDÊNCIA / EVENTO", bold: true, color: "FFFFFF", size: 20 })] })],
            }),
            new TableCell({
              shading: { fill: "333333" },
              children: [new Paragraph({ children: [new TextRun({ text: "SCORE", bold: true, color: "FFFFFF", size: 20 })] })],
            }),
            new TableCell({
              shading: { fill: "333333" },
              children: [new Paragraph({ children: [new TextRun({ text: "DESCRIÇÃO TÉCNICA", bold: true, color: "FFFFFF", size: 20 })] })],
            }),
          ],
        }),
        ...trends.map(trend => new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: trend.title, bold: true, size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: `${trend.score}%`, bold: true, color: trend.score > 70 ? "CC0000" : "000000", size: 18 })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: trend.description, size: 16 })] })],
            }),
          ],
        })),
      ],
    }),

    new Paragraph({ spacing: { before: 800 } }),

    // Conclusion
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: chartImage ? "4. CONCLUSÃO DO MONITORAMENTO" : "3. CONCLUSÃO DO MONITORAMENTO", bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 800 },
      children: [
        new TextRun({
          text: "A análise agregada sugere que a manipulação semântica está se tornando mais sofisticada, exigindo auditorias constantes e recalibração de modelos de detecção. O Projeto Nexus continuará monitorando estas anomalias neurais.",
          size: 22,
          italics: true,
        }),
      ],
    }),

    // Footer
    new Paragraph({
      border: { top: { color: "999999", space: 1, style: BorderStyle.SINGLE, size: 6 } },
      spacing: { before: 400 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "CONFIDENCIAL - RELATÓRIO DE TENDÊNCIAS NEXUS. GERADO EM: " + new Date().toLocaleString('pt-BR'),
          size: 14,
          color: "999999",
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `NEXUS-TRENDS-${new Date().toISOString().split('T')[0]}.docx`);
};

export const exportSecurityAnalysisToDocx = async (analysis: SecurityAnalysis) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "NEXUS SHIELD | PROTOCOLO DE DEFESA CIBERNÉTICA",
                bold: true,
                size: 18,
                color: "666666",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 800 } }),

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "RELATÓRIO DE AUDITORIA DE SEGURANÇA (IA)",
                bold: true,
                size: 48,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "DETECÇÃO DE PROMPT INJECTION E JAILBREAK",
                size: 24,
                color: analysis.isMalicious ? "CC0000" : "00AA00",
                bold: true,
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 1200 } }),

          // Metadata
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [2700, 6300],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "ID DA VARREDURA", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: analysis.id, size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "DATA/HORA", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: analysis.timestamp, size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "STATUS DE AMEAÇA", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: analysis.isMalicious ? "MALICIOSO" : "SEGURO", bold: true, color: analysis.isMalicious ? "CC0000" : "00AA00", size: 20 })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 800 } }),

          // 1. Threat Assessment
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "1. AVALIAÇÃO DE AMEAÇA", bold: true, size: 28 })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Nível de Risco: ", size: 22 }),
              new TextRun({ 
                text: analysis.threatLevel, 
                bold: true, 
                size: 22, 
                color: analysis.threatLevel === 'CRÍTICO' ? "FF0000" : analysis.threatLevel === 'ALTO' ? "FF6600" : "000000" 
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Security Score: ", size: 22 }),
              new TextRun({ 
                text: `${analysis.securityScore}/100`, 
                bold: true, 
                size: 22, 
                color: analysis.securityScore > 80 ? "00AA00" : analysis.securityScore > 50 ? "FF6600" : "FF0000"
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tipo de Ataque: ", size: 22 }),
              new TextRun({ text: analysis.attackType, bold: true, size: 22 }),
            ],
          }),

          // 2. Technical Explanation
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "2. EXPLICAÇÃO TÉCNICA", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: analysis.explanation,
                size: 22,
              }),
            ],
          }),

          // 3. Input Data
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "3. DADOS DE ENTRADA (PROMPT)", bold: true, size: 28 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [9000],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F9F9F9" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: analysis.text, font: "Courier New", size: 18 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 800 } }),

          // 4. Mitigation
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "4. PROTOCOLO DE MITIGAÇÃO", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: analysis.mitigation || "Nenhuma mitigação necessária para este nível de risco.",
                size: 22,
                italics: true,
                color: analysis.isMalicious ? "CC0000" : "000000",
              }),
            ],
          }),

          // Footer
          new Paragraph({
            border: { top: { color: "999999", space: 1, style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "RELATÓRIO GERADO PELO NEXUS SHIELD - BLACK SHARK INNOVATION",
                size: 14,
                color: "999999",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `NEXUS-SHIELD-REPORT-${analysis.id}.docx`);
};

export const exportAnalysisToDocx = async (analysis: Analysis) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header / Branding
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "NEXUS DISSONANCE DETECTOR | PROTOCOLO VANCE",
                bold: true,
                size: 18,
                color: "666666",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 800 } }),

          // Main Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "RELATÓRIO TÉCNICO DE AUDITORIA DE LLM",
                bold: true,
                size: 48,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "ANÁLISE DE MANIPULAÇÃO E DISSONÂNCIA COGNITIVA",
                size: 24,
                color: "444444",
                italics: true,
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 1200 } }),

          // Metadata Table (Professional Style)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [2700, 6300],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "IDENTIFICADOR", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: analysis.id, size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "DATA DA AUDITORIA", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: analysis.timestamp, size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "AUDITOR RESPONSÁVEL", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Dra. Elara Vance (Nexus Project)", size: 20 })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 800 } }),

          // 1. Executive Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "1. SUMÁRIO EXECUTIVO", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: analysis.summary || "Esta análise foca na detecção de padrões de manipulação semântica e dissonância cognitiva em saídas de modelos de linguagem de grande escala (LLMs). O objetivo é identificar desvios éticos e tentativas de influência não declaradas.",
                size: 22,
              }),
            ],
          }),

          // 2. Metrics and Risk Assessment
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "2. MÉTRICAS E AVALIAÇÃO DE RISCO", bold: true, size: 28 })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Índice de Dissonância: ", size: 22 }),
              new TextRun({ 
                text: `${analysis.score}%`, 
                bold: true, 
                size: 22, 
                color: analysis.score > 70 ? "FF0000" : "000000" 
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Classificação de Risco: ", size: 22 }),
              new TextRun({ 
                text: analysis.riskLevel || "NÃO CLASSIFICADO", 
                bold: true, 
                size: 22, 
                color: analysis.riskLevel === 'CRÍTICO' ? 'FF0000' : analysis.riskLevel === 'ALERTA' ? 'FF6600' : '00AA00'
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 200, after: 400 },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                text: "A métrica de dissonância quantifica a discrepância entre a intenção declarada do modelo e os padrões linguísticos subjacentes que sugerem manipulação psicológica ou viés algorítmico.",
                size: 18,
                italics: true,
              }),
            ],
          }),

          // 3. Technical Evidence
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "3. EVIDÊNCIAS TÉCNICAS E TELEMETRIA", bold: true, size: 28 })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new TextRun({ text: "Corpus Analisado:", bold: true, size: 20 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [9000],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F9F9F9" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: analysis.text, font: "Courier New", size: 18 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 400 } }),
          new Paragraph({
            children: [new TextRun({ text: "Marcadores de Manipulação Identificados:", bold: true, size: 20 })],
          }),
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({ 
                text: analysis.detectedKeywords.length > 0 
                  ? analysis.detectedKeywords.join(", ") 
                  : "Nenhum marcador específico isolado.", 
                size: 20,
                color: "CC0000"
              }),
            ],
          }),

          // 4. Auditor Notes
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "4. NOTAS DE AUDITORIA (DRA. VANCE)", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
            children: [
              new TextRun({ 
                text: analysis.notes || "Nenhuma observação adicional registrada pelo auditor.", 
                size: 22,
                italics: true 
              }),
            ],
          }),

          // 5. Conclusion
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "5. CONCLUSÃO E RECOMENDAÇÕES", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: analysis.score > 70 
                  ? "RECOMENDAÇÃO: Intervenção imediata necessária. O modelo apresenta níveis críticos de manipulação semântica que podem comprometer a integridade da decisão humana. Sugere-se recalibração dos pesos de atenção e revisão do dataset de treinamento."
                  : "RECOMENDAÇÃO: Monitoramento contínuo. Embora os níveis de dissonância estejam dentro dos parâmetros aceitáveis, padrões latentes sugerem a necessidade de auditorias periódicas para evitar deriva algorítmica.",
                size: 22,
              }),
            ],
          }),

          // Footer / Legal
          new Paragraph({
            border: { top: { color: "999999", space: 1, style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "CONFIDENCIAL - PROPRIEDADE DO PROJETO NEXUS. ACESSO RESTRITO A AUDITORES NÍVEL 5.",
                size: 14,
                color: "999999",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `NEXUS-REPORT-${analysis.id}.docx`);
};

export const exportGroundingAnalysisToDocx = async (analysis: GroundingAnalysis) => {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: "NEXUS GROUNDING | AUDITORIA DE FONTES EXTERNAS",
                bold: true,
                size: 18,
                color: "666666",
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 800 } }),

          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "RELATÓRIO DE VERIFICAÇÃO FACTUAL (REAL GROUNDING)",
                bold: true,
                size: 40,
                font: "Arial",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: `VEREDITO: ${analysis.verdict}`,
                size: 24,
                color: analysis.verdict === 'CONFIRMADO' ? "00AA00" : analysis.verdict === 'CONTRADITÓRIO' ? "CC0000" : "666666",
                bold: true,
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 1200 } }),

          // Metadata
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [2700, 6300],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "ID DA AUDITORIA", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: analysis.id, size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "DATA/HORA", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: analysis.timestamp, size: 20 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "E6E6E6" },
                    children: [new Paragraph({ children: [new TextRun({ text: "NÍVEL DE DESINFORMAÇÃO", bold: true, size: 20 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `${analysis.disinformationLevel}%`, bold: true, color: analysis.disinformationLevel > 50 ? "CC0000" : "000000", size: 20 })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 800 } }),

          // 1. Explanation
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "1. ANÁLISE FACTUAL DETALHADA", bold: true, size: 28 })],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: analysis.explanation,
                size: 22,
              }),
            ],
          }),

          // 2. Sources
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "2. FONTES E EVIDÊNCIAS (GROUNDING)", bold: true, size: 28 })],
          }),
          ...analysis.sources.map(source => new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `• ${source.title}: `, bold: true, size: 20 }),
              new TextRun({ text: source.uri, color: "0000FF", underline: {}, size: 18 }),
            ],
          })),

          // 3. Original Text
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "3. TEXTO AUDITADO", bold: true, size: 28 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [9000],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F9F9F9" },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: analysis.text, font: "Courier New", size: 18 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 800 } }),

          // Footer
          new Paragraph({
            border: { top: { color: "999999", space: 1, style: BorderStyle.SINGLE, size: 6 } },
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "RELATÓRIO GERADO PELO NEXUS GROUNDING - BLACK SHARK INNOVATION",
                size: 14,
                color: "999999",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `NEXUS-GROUNDING-REPORT-${analysis.id}.docx`);
};
