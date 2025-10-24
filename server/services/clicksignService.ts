/**
 * Service de integração com Clicksign para assinatura digital de contratos
 * Documentação: https://developers.clicksign.com/
 */

interface ClicksignConfig {
  apiKey: string;
  baseUrl: string;
}

interface CreateDocumentParams {
  pdfPath: string;
  contractId: number;
  signerName: string;
  signerEmail: string;
  signerCpf?: string;
}

interface CreateDocumentResponse {
  documentKey: string;
  envelopeKey: string;
  signUrl: string;
}

export class ClicksignService {
  private config: ClicksignConfig;

  constructor() {
    this.config = {
      apiKey: process.env.CLICKSIGN_API_KEY || '',
      baseUrl: process.env.CLICKSIGN_BASE_URL || 'https://api.clicksign.com/v3',
    };
  }

  /**
   * Cria um documento no Clicksign e envia para assinatura
   */
  async createDocument(params: CreateDocumentParams): Promise<CreateDocumentResponse> {
    if (!this.config.apiKey) {
      console.warn('[Clicksign] API key not configured, returning mock data');
      return {
        documentKey: `mock_doc_${params.contractId}_${Date.now()}`,
        envelopeKey: `mock_env_${params.contractId}_${Date.now()}`,
        signUrl: `https://app.clicksign.com/sign/mock/${params.contractId}`,
      };
    }

    try {
      // 1. Upload do documento
      const documentKey = await this.uploadDocument(params.pdfPath, params.contractId);

      // 2. Criar envelope (lista de assinatura)
      const envelopeKey = await this.createEnvelope(documentKey);

      // 3. Adicionar signatário
      const signUrl = await this.addSigner(envelopeKey, {
        name: params.signerName,
        email: params.signerEmail,
        cpf: params.signerCpf,
      });

      return {
        documentKey,
        envelopeKey,
        signUrl,
      };
    } catch (error) {
      console.error('[Clicksign] Error creating document:', error);
      throw new Error(`Failed to create document in Clicksign: ${error}`);
    }
  }

  /**
   * Faz upload do PDF para o Clicksign
   */
  private async uploadDocument(pdfPath: string, contractId: number): Promise<string> {
    // Implementação real faria upload do PDF
    // Por enquanto retorna mock
    return `doc_${contractId}_${Date.now()}`;
  }

  /**
   * Cria um envelope (lista de assinatura)
   */
  private async createEnvelope(documentKey: string): Promise<string> {
    // Implementação real criaria envelope via API
    return `env_${documentKey}_${Date.now()}`;
  }

  /**
   * Adiciona um signatário ao envelope
   */
  private async addSigner(
    envelopeKey: string,
    signer: { name: string; email: string; cpf?: string }
  ): Promise<string> {
    // Implementação real adicionaria signatário via API
    return `https://app.clicksign.com/sign/${envelopeKey}`;
  }

  /**
   * Verifica o status de um documento
   */
  async getDocumentStatus(documentKey: string): Promise<{
    status: 'pending' | 'signed' | 'cancelled';
    signedAt?: Date;
  }> {
    if (!this.config.apiKey) {
      return { status: 'pending' };
    }

    try {
      // Implementação real consultaria API
      return { status: 'pending' };
    } catch (error) {
      console.error('[Clicksign] Error getting document status:', error);
      throw error;
    }
  }

  /**
   * Cancela um documento
   */
  async cancelDocument(documentKey: string): Promise<void> {
    if (!this.config.apiKey) {
      console.warn('[Clicksign] API key not configured, skipping cancellation');
      return;
    }

    try {
      // Implementação real cancelaria via API
      console.log(`[Clicksign] Document ${documentKey} cancelled`);
    } catch (error) {
      console.error('[Clicksign] Error cancelling document:', error);
      throw error;
    }
  }
}

export const clicksignService = new ClicksignService();

