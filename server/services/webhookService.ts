/**
 * Service de Webhooks para integração com CRM
 * Envia dados automaticamente quando eventos importantes acontecem
 */

import type { Contract, Client, Signature } from '../db';

interface WebhookConfig {
  crmUrl: string;
  secret: string;
}

interface ContractSignedPayload {
  evento: 'contrato_assinado';
  cliente: {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    cpfCnpj: string | null;
  };
  contrato: {
    id: number;
    descricao: string;
    valor: number; // em centavos
    periodicidade: string;
    duracao_meses: number;
    data_inicio: string;
    data_fim: string;
    servicos: string[]; // extraído da descrição ou campo personalizado
  };
  assinatura: {
    documento_url: string;
    assinado_em: string;
    clicksign_envelope_key: string | null;
  };
  timestamp: string;
}

export class WebhookService {
  private config: WebhookConfig;

  constructor() {
    this.config = {
      crmUrl: process.env.CRM_WEBHOOK_URL || '',
      secret: process.env.CRM_WEBHOOK_SECRET || '',
    };
  }

  /**
   * Envia webhook quando contrato é assinado
   */
  async sendContractSigned(params: {
    contract: Contract;
    client: Client;
    signature: Signature;
  }): Promise<boolean> {
    if (!this.config.crmUrl) {
      console.warn('[Webhook] CRM URL not configured, skipping webhook');
      return false;
    }

    try {
      const payload: ContractSignedPayload = {
        evento: 'contrato_assinado',
        cliente: {
          id: params.client.id,
          nome: params.client.name,
          email: params.client.email,
          telefone: params.client.phone,
          cpfCnpj: params.client.cpfCnpj,
        },
        contrato: {
          id: params.contract.id,
          descricao: params.contract.description,
          valor: params.contract.value,
          periodicidade: params.contract.periodicity,
          duracao_meses: params.contract.durationMonths,
          data_inicio: params.contract.startDate?.toISOString() || new Date().toISOString(),
          data_fim: params.contract.endDate?.toISOString() || new Date().toISOString(),
          servicos: this.extractServices(params.contract.description),
        },
        assinatura: {
          documento_url: params.contract.pdfUrl || '',
          assinado_em: params.signature.signedAt?.toISOString() || new Date().toISOString(),
          clicksign_envelope_key: params.signature.clicksignEnvelopeKey,
        },
        timestamp: new Date().toISOString(),
      };

      // Fazer requisição HTTP para o CRM
      const response = await fetch(this.config.crmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': this.config.secret,
          'User-Agent': 'SaaS-Cobrancas-Webhook/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      console.log(`[Webhook] Contract signed sent to CRM: ${params.contract.id}`);
      
      // Registrar log do webhook (opcional)
      await this.logWebhook({
        event: 'contrato_assinado',
        payload,
        status: 'success',
        response: await response.text(),
      });

      return true;
    } catch (error) {
      console.error('[Webhook] Error sending contract signed:', error);
      
      // Registrar erro
      await this.logWebhook({
        event: 'contrato_assinado',
        payload: {
          contract_id: params.contract.id,
          client_id: params.client.id,
        },
        status: 'error',
        error: String(error),
      });

      return false;
    }
  }

  /**
   * Envia webhook quando pagamento é confirmado
   */
  async sendPaymentConfirmed(params: {
    invoiceId: number;
    clientId: number;
    value: number;
    paidAt: Date;
  }): Promise<boolean> {
    if (!this.config.crmUrl) {
      return false;
    }

    try {
      const payload = {
        evento: 'pagamento_confirmado',
        fatura_id: params.invoiceId,
        cliente_id: params.clientId,
        valor: params.value,
        pago_em: params.paidAt.toISOString(),
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.config.crmUrl.replace('/contrato-assinado', '/pagamento-confirmado'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': this.config.secret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      console.log(`[Webhook] Payment confirmed sent to CRM: ${params.invoiceId}`);
      return true;
    } catch (error) {
      console.error('[Webhook] Error sending payment confirmed:', error);
      return false;
    }
  }

  /**
   * Envia webhook quando contrato é cancelado
   */
  async sendContractCancelled(params: {
    contractId: number;
    clientId: number;
    reason?: string;
  }): Promise<boolean> {
    if (!this.config.crmUrl) {
      return false;
    }

    try {
      const payload = {
        evento: 'contrato_cancelado',
        contrato_id: params.contractId,
        cliente_id: params.clientId,
        motivo: params.reason || 'Não especificado',
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(this.config.crmUrl.replace('/contrato-assinado', '/contrato-cancelado'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': this.config.secret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      console.log(`[Webhook] Contract cancelled sent to CRM: ${params.contractId}`);
      return true;
    } catch (error) {
      console.error('[Webhook] Error sending contract cancelled:', error);
      return false;
    }
  }

  /**
   * Extrai serviços da descrição do contrato
   */
  private extractServices(description: string): string[] {
    // Lógica simples de extração
    // Pode ser melhorada com IA ou regex mais sofisticado
    const keywords = [
      'Google Ads',
      'Meta Ads',
      'Facebook Ads',
      'Instagram Ads',
      'TikTok Ads',
      'LinkedIn Ads',
      'SEO',
      'Gestão de Redes Sociais',
      'Criação de Conteúdo',
      'Design Gráfico',
      'Desenvolvimento Web',
      'Consultoria',
      'Relatórios',
      'Analytics',
    ];

    const found: string[] = [];
    const lowerDesc = description.toLowerCase();

    keywords.forEach((keyword) => {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    });

    return found.length > 0 ? found : ['Serviços gerais'];
  }

  /**
   * Registra log de webhook (salvar no banco de dados)
   */
  private async logWebhook(params: {
    event: string;
    payload: any;
    status: 'success' | 'error';
    response?: string;
    error?: string;
  }): Promise<void> {
    try {
      // Aqui você salvaria no banco de dados na tabela webhooks_log
      console.log('[Webhook Log]', {
        event: params.event,
        status: params.status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[Webhook] Error logging webhook:', error);
    }
  }

  /**
   * Testa conexão com o CRM
   */
  async testConnection(): Promise<boolean> {
    if (!this.config.crmUrl) {
      return false;
    }

    try {
      const response = await fetch(this.config.crmUrl.replace('/contrato-assinado', '/health'), {
        method: 'GET',
        headers: {
          'X-Webhook-Secret': this.config.secret,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('[Webhook] Error testing connection:', error);
      return false;
    }
  }
}

export const webhookService = new WebhookService();

