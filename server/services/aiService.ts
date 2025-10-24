/**
 * Service de Inteligência Artificial com OpenAI
 * Funcionalidades: Geração de contratos, análise de risco, chatbot
 */

interface AIConfig {
  apiKey: string;
  model: string;
}

interface GenerateContractParams {
  clientName: string;
  service: string;
  value: number; // em centavos
  durationMonths: number;
  periodicity: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
}

interface AnalyzeRiskParams {
  clientId: number;
  paymentHistory: Array<{
    dueDate: Date;
    paidAt: Date | null;
    value: number;
  }>;
}

interface ChatbotParams {
  question: string;
  clientId: number;
  context?: string;
}

export class AIService {
  private config: AIConfig;

  constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    };
  }

  /**
   * Gera um contrato personalizado usando IA
   */
  async generateContract(params: GenerateContractParams): Promise<string> {
    if (!this.config.apiKey) {
      console.warn('[AI] OpenAI not configured, returning template contract');
      return this.getTemplateContract(params);
    }

    try {
      const periodicityMap = {
        monthly: 'mensal',
        quarterly: 'trimestral',
        semiannual: 'semestral',
        annual: 'anual',
      };

      const prompt = `
Gere um contrato profissional de prestação de serviços com as seguintes informações:

- Cliente: ${params.clientName}
- Serviço: ${params.service}
- Valor: R$ ${(params.value / 100).toFixed(2)}
- Periodicidade: ${periodicityMap[params.periodicity]}
- Duração: ${params.durationMonths} meses

O contrato deve incluir:
1. Identificação das partes
2. Objeto do contrato (descrição detalhada do serviço)
3. Valor e forma de pagamento
4. Prazo de vigência
5. Obrigações do contratante
6. Obrigações do contratado
7. Cláusulas de rescisão
8. Cláusulas de confidencialidade
9. Foro

Use linguagem jurídica adequada mas acessível. Formato em Markdown.
`;

      // Aqui seria a chamada real para OpenAI
      // const response = await openai.chat.completions.create({
      //   model: this.config.model,
      //   messages: [{ role: 'user', content: prompt }],
      // });
      // return response.choices[0].message.content;

      // Por enquanto retorna template
      return this.getTemplateContract(params);
    } catch (error) {
      console.error('[AI] Error generating contract:', error);
      return this.getTemplateContract(params);
    }
  }

  /**
   * Analisa risco de inadimplência de um cliente
   */
  async analyzeRisk(params: AnalyzeRiskParams): Promise<{
    risk: 'low' | 'medium' | 'high';
    score: number; // 0-100
    reasons: string[];
  }> {
    if (!this.config.apiKey) {
      console.warn('[AI] OpenAI not configured, returning basic risk analysis');
      return this.getBasicRiskAnalysis(params);
    }

    try {
      // Calcular métricas básicas
      const totalPayments = params.paymentHistory.length;
      const latePayments = params.paymentHistory.filter((p) => {
        if (!p.paidAt) return false;
        return new Date(p.paidAt) > new Date(p.dueDate);
      }).length;

      const unpaidPayments = params.paymentHistory.filter((p) => !p.paidAt).length;

      const lateRate = totalPayments > 0 ? (latePayments / totalPayments) * 100 : 0;
      const unpaidRate = totalPayments > 0 ? (unpaidPayments / totalPayments) * 100 : 0;

      const prompt = `
Analise o risco de inadimplência deste cliente:

Histórico de Pagamentos:
- Total de faturas: ${totalPayments}
- Pagamentos atrasados: ${latePayments} (${lateRate.toFixed(1)}%)
- Pagamentos não realizados: ${unpaidPayments} (${unpaidRate.toFixed(1)}%)

Com base nesses dados, classifique o risco como:
- low (baixo): Cliente confiável, histórico de pagamentos em dia
- medium (médio): Alguns atrasos, mas paga eventualmente
- high (alto): Muitos atrasos ou não pagamentos

Retorne um JSON com:
{
  "risk": "low" | "medium" | "high",
  "score": 0-100,
  "reasons": ["motivo 1", "motivo 2"]
}
`;

      // Aqui seria a chamada real para OpenAI
      // const response = await openai.chat.completions.create({
      //   model: this.config.model,
      //   messages: [{ role: 'user', content: prompt }],
      //   response_format: { type: 'json_object' },
      // });
      // return JSON.parse(response.choices[0].message.content);

      // Por enquanto retorna análise básica
      return this.getBasicRiskAnalysis(params);
    } catch (error) {
      console.error('[AI] Error analyzing risk:', error);
      return this.getBasicRiskAnalysis(params);
    }
  }

  /**
   * Chatbot para responder perguntas dos clientes
   */
  async chatbot(params: ChatbotParams): Promise<string> {
    if (!this.config.apiKey) {
      console.warn('[AI] OpenAI not configured, returning default response');
      return 'Desculpe, o chatbot está temporariamente indisponível. Entre em contato com o suporte.';
    }

    try {
      const prompt = `
Você é um assistente virtual de uma plataforma de cobranças e assinaturas.
Responda a seguinte pergunta do cliente de forma clara e objetiva:

Pergunta: ${params.question}

${params.context ? `Contexto adicional: ${params.context}` : ''}

Seja educado, profissional e direto ao ponto.
`;

      // Aqui seria a chamada real para OpenAI
      // const response = await openai.chat.completions.create({
      //   model: this.config.model,
      //   messages: [{ role: 'user', content: prompt }],
      // });
      // return response.choices[0].message.content;

      // Por enquanto retorna resposta padrão
      return 'Obrigado pela sua pergunta! Nossa equipe irá analisá-la e responder em breve.';
    } catch (error) {
      console.error('[AI] Error in chatbot:', error);
      return 'Desculpe, ocorreu um erro. Por favor, tente novamente.';
    }
  }

  /**
   * Sugere valor para um contrato baseado em histórico
   */
  async suggestValue(params: {
    service: string;
    clientHistory?: Array<{ service: string; value: number }>;
  }): Promise<{ suggestedValue: number; confidence: number }> {
    if (!this.config.apiKey) {
      return { suggestedValue: 100000, confidence: 0.5 }; // R$ 1000
    }

    // Implementação com IA
    return { suggestedValue: 150000, confidence: 0.8 }; // R$ 1500
  }

  // Métodos auxiliares

  private getTemplateContract(params: GenerateContractParams): string {
    const periodicityMap = {
      monthly: 'mensal',
      quarterly: 'trimestral',
      semiannual: 'semestral',
      annual: 'anual',
    };

    return `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS

## 1. PARTES

**CONTRATANTE**: ${params.clientName}

**CONTRATADA**: [Nome da sua empresa]

## 2. OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação de serviços de **${params.service}**.

## 3. VALOR E FORMA DE PAGAMENTO

O valor dos serviços prestados será de **R$ ${(params.value / 100).toFixed(2)}** (${this.numberToWords(params.value / 100)}), a ser pago de forma **${periodicityMap[params.periodicity]}**.

## 4. PRAZO DE VIGÊNCIA

O presente contrato terá vigência de **${params.durationMonths} meses**, a contar da data de assinatura.

## 5. OBRIGAÇÕES DO CONTRATANTE

- Efetuar o pagamento nas datas acordadas
- Fornecer informações necessárias para execução dos serviços
- Manter comunicação ativa com a CONTRATADA

## 6. OBRIGAÇÕES DA CONTRATADA

- Executar os serviços com qualidade e profissionalismo
- Manter sigilo sobre informações do CONTRATANTE
- Entregar relatórios conforme acordado

## 7. RESCISÃO

O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 dias.

## 8. CONFIDENCIALIDADE

As partes comprometem-se a manter sigilo sobre informações confidenciais.

## 9. FORO

Fica eleito o foro da comarca de [Cidade/Estado] para dirimir quaisquer dúvidas oriundas deste contrato.

---

**Data**: ___/___/______

**CONTRATANTE**: _________________________________

**CONTRATADA**: _________________________________
`;
  }

  private getBasicRiskAnalysis(params: AnalyzeRiskParams): {
    risk: 'low' | 'medium' | 'high';
    score: number;
    reasons: string[];
  } {
    const totalPayments = params.paymentHistory.length;
    const latePayments = params.paymentHistory.filter((p) => {
      if (!p.paidAt) return false;
      return new Date(p.paidAt) > new Date(p.dueDate);
    }).length;

    const unpaidPayments = params.paymentHistory.filter((p) => !p.paidAt).length;

    const lateRate = totalPayments > 0 ? (latePayments / totalPayments) * 100 : 0;
    const unpaidRate = totalPayments > 0 ? (unpaidPayments / totalPayments) * 100 : 0;

    let risk: 'low' | 'medium' | 'high' = 'low';
    let score = 100;
    const reasons: string[] = [];

    if (unpaidRate > 20) {
      risk = 'high';
      score = 30;
      reasons.push(`${unpaidRate.toFixed(0)}% de faturas não pagas`);
    } else if (unpaidRate > 10 || lateRate > 30) {
      risk = 'medium';
      score = 60;
      if (unpaidRate > 10) reasons.push(`${unpaidRate.toFixed(0)}% de faturas não pagas`);
      if (lateRate > 30) reasons.push(`${lateRate.toFixed(0)}% de pagamentos atrasados`);
    } else {
      reasons.push('Histórico de pagamentos positivo');
      if (lateRate > 0) reasons.push(`Apenas ${lateRate.toFixed(0)}% de atrasos`);
    }

    return { risk, score, reasons };
  }

  private numberToWords(num: number): string {
    // Implementação simplificada
    return `${num.toFixed(2)} reais`;
  }
}

export const aiService = new AIService();

