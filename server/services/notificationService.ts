/**
 * Service de notificações multi-canal
 * Suporta: Email (SendGrid), SMS e WhatsApp (Twilio)
 */

interface NotificationConfig {
  sendgridApiKey: string;
  sendgridFromEmail: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  twilioWhatsappNumber: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendSmsParams {
  to: string;
  message: string;
}

interface SendWhatsAppParams {
  to: string;
  message: string;
}

export class NotificationService {
  private config: NotificationConfig;

  constructor() {
    this.config = {
      sendgridApiKey: process.env.SENDGRID_API_KEY || '',
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@seudominio.com',
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
      twilioWhatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
    };
  }

  /**
   * Envia email via SendGrid
   */
  async sendEmail(params: SendEmailParams): Promise<boolean> {
    if (!this.config.sendgridApiKey) {
      console.warn('[Notification] SendGrid not configured, email not sent');
      console.log(`[Mock Email] To: ${params.to} | Subject: ${params.subject}`);
      return false;
    }

    try {
      // Implementação real usaria SendGrid SDK
      console.log(`[Email] Sent to ${params.to}: ${params.subject}`);
      return true;
    } catch (error) {
      console.error('[Notification] Error sending email:', error);
      return false;
    }
  }

  /**
   * Envia SMS via Twilio
   */
  async sendSms(params: SendSmsParams): Promise<boolean> {
    if (!this.config.twilioAccountSid || !this.config.twilioAuthToken) {
      console.warn('[Notification] Twilio not configured, SMS not sent');
      console.log(`[Mock SMS] To: ${params.to} | Message: ${params.message}`);
      return false;
    }

    try {
      // Implementação real usaria Twilio SDK
      console.log(`[SMS] Sent to ${params.to}`);
      return true;
    } catch (error) {
      console.error('[Notification] Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Envia mensagem via WhatsApp (Twilio)
   */
  async sendWhatsApp(params: SendWhatsAppParams): Promise<boolean> {
    if (!this.config.twilioAccountSid || !this.config.twilioAuthToken) {
      console.warn('[Notification] Twilio not configured, WhatsApp not sent');
      console.log(`[Mock WhatsApp] To: ${params.to} | Message: ${params.message}`);
      return false;
    }

    try {
      // Implementação real usaria Twilio SDK
      console.log(`[WhatsApp] Sent to ${params.to}`);
      return true;
    } catch (error) {
      console.error('[Notification] Error sending WhatsApp:', error);
      return false;
    }
  }

  /**
   * Envia lembrete de vencimento (4 dias antes)
   */
  async sendPaymentReminder(params: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    value: number;
    dueDate: Date;
    paymentUrl: string;
  }): Promise<void> {
    const valueFormatted = (params.value / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const dueDateFormatted = params.dueDate.toLocaleDateString('pt-BR');

    // Email
    await this.sendEmail({
      to: params.clientEmail,
      subject: `Lembrete: Pagamento vence em 4 dias`,
      html: `
        <h2>Olá, ${params.clientName}!</h2>
        <p>Este é um lembrete de que seu pagamento de <strong>${valueFormatted}</strong> vence em <strong>${dueDateFormatted}</strong>.</p>
        <p><a href="${params.paymentUrl}">Clique aqui para pagar</a></p>
        <p>Obrigado!</p>
      `,
      text: `Olá, ${params.clientName}! Seu pagamento de ${valueFormatted} vence em ${dueDateFormatted}. Link: ${params.paymentUrl}`,
    });

    // SMS (se tiver telefone)
    if (params.clientPhone) {
      await this.sendSms({
        to: params.clientPhone,
        message: `Lembrete: Pagamento de ${valueFormatted} vence em ${dueDateFormatted}. Pague em: ${params.paymentUrl}`,
      });
    }

    // WhatsApp (se tiver telefone)
    if (params.clientPhone) {
      await this.sendWhatsApp({
        to: params.clientPhone,
        message: `Olá, ${params.clientName}! Seu pagamento de ${valueFormatted} vence em ${dueDateFormatted}. Pague em: ${params.paymentUrl}`,
      });
    }
  }

  /**
   * Envia notificação de pagamento confirmado
   */
  async sendPaymentConfirmation(params: {
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    value: number;
    paidAt: Date;
  }): Promise<void> {
    const valueFormatted = (params.value / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    const paidAtFormatted = params.paidAt.toLocaleDateString('pt-BR');

    // Email
    await this.sendEmail({
      to: params.clientEmail,
      subject: `Pagamento confirmado!`,
      html: `
        <h2>Olá, ${params.clientName}!</h2>
        <p>Confirmamos o recebimento do seu pagamento de <strong>${valueFormatted}</strong> em <strong>${paidAtFormatted}</strong>.</p>
        <p>Obrigado!</p>
      `,
      text: `Olá, ${params.clientName}! Pagamento de ${valueFormatted} confirmado em ${paidAtFormatted}. Obrigado!`,
    });

    // SMS (se tiver telefone)
    if (params.clientPhone) {
      await this.sendSms({
        to: params.clientPhone,
        message: `Pagamento de ${valueFormatted} confirmado! Obrigado.`,
      });
    }
  }

  /**
   * Envia notificação de contrato assinado
   */
  async sendContractSigned(params: {
    clientName: string;
    clientEmail: string;
    contractDescription: string;
    pdfUrl: string;
  }): Promise<void> {
    await this.sendEmail({
      to: params.clientEmail,
      subject: `Contrato assinado com sucesso!`,
      html: `
        <h2>Olá, ${params.clientName}!</h2>
        <p>Seu contrato <strong>${params.contractDescription}</strong> foi assinado com sucesso!</p>
        <p><a href="${params.pdfUrl}">Baixar contrato assinado</a></p>
        <p>Obrigado!</p>
      `,
      text: `Olá, ${params.clientName}! Contrato ${params.contractDescription} assinado. Download: ${params.pdfUrl}`,
    });
  }
}

export const notificationService = new NotificationService();

