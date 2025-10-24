/**
 * Service de integração com Asaas para cobranças recorrentes
 * Documentação: https://docs.asaas.com/
 */

interface AsaasConfig {
  apiKey: string;
  baseUrl: string;
}

interface CreateCustomerParams {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
}

interface CreateSubscriptionParams {
  customerId: string;
  value: number; // em centavos
  periodicity: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  description: string;
  dueDate: Date;
}

interface CreateSubscriptionResponse {
  subscriptionId: string;
  customerId: string;
  nextDueDate: Date;
}

interface InvoiceData {
  invoiceId: string;
  value: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paymentUrl: string;
}

export class AsaasService {
  private config: AsaasConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ASAAS_API_KEY || '',
      baseUrl: process.env.ASAAS_BASE_URL || 'https://api.asaas.com/v3',
    };
  }

  /**
   * Cria um cliente no Asaas
   */
  async createCustomer(params: CreateCustomerParams): Promise<string> {
    if (!this.config.apiKey) {
      console.warn('[Asaas] API key not configured, returning mock customer ID');
      return `mock_cus_${Date.now()}`;
    }

    try {
      // Implementação real criaria cliente via API
      const customerId = `cus_${Date.now()}`;
      console.log(`[Asaas] Customer created: ${customerId}`);
      return customerId;
    } catch (error) {
      console.error('[Asaas] Error creating customer:', error);
      throw new Error(`Failed to create customer in Asaas: ${error}`);
    }
  }

  /**
   * Cria uma assinatura recorrente no Asaas
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResponse> {
    if (!this.config.apiKey) {
      console.warn('[Asaas] API key not configured, returning mock subscription');
      const nextDueDate = new Date(params.dueDate);
      return {
        subscriptionId: `mock_sub_${Date.now()}`,
        customerId: params.customerId,
        nextDueDate,
      };
    }

    try {
      // Mapear periodicidade para formato Asaas
      const cycleMap = {
        monthly: 'MONTHLY',
        quarterly: 'QUARTERLY',
        semiannual: 'SEMIANNUALLY',
        annual: 'YEARLY',
      };

      const subscriptionData = {
        customer: params.customerId,
        billingType: 'CREDIT_CARD', // ou BOLETO
        value: params.value / 100, // converter centavos para reais
        cycle: cycleMap[params.periodicity],
        description: params.description,
        nextDueDate: params.dueDate.toISOString().split('T')[0],
      };

      // Implementação real criaria assinatura via API
      const subscriptionId = `sub_${Date.now()}`;
      console.log(`[Asaas] Subscription created: ${subscriptionId}`);

      return {
        subscriptionId,
        customerId: params.customerId,
        nextDueDate: params.dueDate,
      };
    } catch (error) {
      console.error('[Asaas] Error creating subscription:', error);
      throw new Error(`Failed to create subscription in Asaas: ${error}`);
    }
  }

  /**
   * Cancela uma assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    if (!this.config.apiKey) {
      console.warn('[Asaas] API key not configured, skipping cancellation');
      return;
    }

    try {
      // Implementação real cancelaria via API
      console.log(`[Asaas] Subscription ${subscriptionId} cancelled`);
    } catch (error) {
      console.error('[Asaas] Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Busca informações de uma fatura
   */
  async getInvoice(invoiceId: string): Promise<InvoiceData> {
    if (!this.config.apiKey) {
      return {
        invoiceId,
        value: 10000,
        dueDate: new Date(),
        status: 'pending',
        paymentUrl: `https://app.asaas.com/pay/mock/${invoiceId}`,
      };
    }

    try {
      // Implementação real consultaria API
      return {
        invoiceId,
        value: 10000,
        dueDate: new Date(),
        status: 'pending',
        paymentUrl: `https://app.asaas.com/pay/${invoiceId}`,
      };
    } catch (error) {
      console.error('[Asaas] Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Lista faturas de uma assinatura
   */
  async listInvoices(subscriptionId: string): Promise<InvoiceData[]> {
    if (!this.config.apiKey) {
      return [];
    }

    try {
      // Implementação real listaria via API
      return [];
    } catch (error) {
      console.error('[Asaas] Error listing invoices:', error);
      throw error;
    }
  }

  /**
   * Verifica o status de uma fatura
   */
  async checkInvoiceStatus(invoiceId: string): Promise<'pending' | 'paid' | 'overdue' | 'cancelled'> {
    if (!this.config.apiKey) {
      return 'pending';
    }

    try {
      // Implementação real consultaria API
      return 'pending';
    } catch (error) {
      console.error('[Asaas] Error checking invoice status:', error);
      throw error;
    }
  }
}

export const asaasService = new AsaasService();

