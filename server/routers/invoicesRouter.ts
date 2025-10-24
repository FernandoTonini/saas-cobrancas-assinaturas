import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { asaasService } from "../services/asaasService";
import { notificationService } from "../services/notificationService";

export const invoicesRouter = router({
  /**
   * Lista todas as faturas
   */
  list: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number().optional(),
        status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const invoices = await db.listInvoices(input);
      return invoices;
    }),

  /**
   * Busca uma fatura por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const invoice = await db.getInvoiceById(input.id);
      if (!invoice) {
        throw new Error("Fatura não encontrada");
      }
      return invoice;
    }),

  /**
   * Marca fatura como paga
   */
  markAsPaid: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input }) => {
      const invoice = await db.getInvoiceById(input.invoiceId);
      if (!invoice) {
        throw new Error("Fatura não encontrada");
      }

      // Atualizar fatura
      await db.updateInvoice(input.invoiceId, {
        status: "paid",
        paidAt: new Date(),
      });

      // Buscar subscription e contract para pegar dados do cliente
      const subscription = await db.getSubscriptionByContractId(invoice.subscriptionId);
      if (subscription) {
        const contract = await db.getContractById(subscription.contractId);
        if (contract) {
          const client = await db.getClientById(contract.contract.clientId);
          if (client) {
            // Enviar notificação de pagamento confirmado
            await notificationService.sendPaymentConfirmation({
              clientName: client.name,
              clientEmail: client.email,
              clientPhone: client.phone || undefined,
              value: invoice.value,
              paidAt: new Date(),
            });
          }
        }
      }

      return await db.getInvoiceById(input.invoiceId);
    }),

  /**
   * Envia lembrete de pagamento manualmente
   */
  sendReminder: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input }) => {
      const invoice = await db.getInvoiceById(input.invoiceId);
      if (!invoice) {
        throw new Error("Fatura não encontrada");
      }

      // Buscar dados do cliente
      const subscription = await db.getSubscriptionByContractId(invoice.subscriptionId);
      if (!subscription) {
        throw new Error("Assinatura não encontrada");
      }

      const contract = await db.getContractById(subscription.contractId);
      if (!contract) {
        throw new Error("Contrato não encontrado");
      }

      const client = await db.getClientById(contract.contract.clientId);
      if (!client) {
        throw new Error("Cliente não encontrado");
      }

      // Buscar URL de pagamento do Asaas
      const asaasInvoice = invoice.asaasInvoiceId
        ? await asaasService.getInvoice(invoice.asaasInvoiceId)
        : null;

      // Enviar lembrete
      await notificationService.sendPaymentReminder({
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone || undefined,
        value: invoice.value,
        dueDate: invoice.dueDate,
        paymentUrl: asaasInvoice?.paymentUrl || "#",
      });

      // Marcar lembrete como enviado
      await db.updateInvoice(input.invoiceId, {
        reminderSent: 1,
      });

      // Registrar notificação
      await db.createNotification({
        clientId: client.id,
        invoiceId: invoice.id,
        type: "email",
        purpose: "reminder",
        status: "sent",
        message: `Lembrete de pagamento enviado`,
        sentAt: new Date(),
      });

      return { success: true };
    }),

  /**
   * Busca faturas que precisam de lembrete (4 dias antes do vencimento)
   */
  getPendingReminders: protectedProcedure.query(async () => {
    const allInvoices = await db.listInvoices({ status: "pending" });

    // Filtrar faturas que vencem em 4 dias e ainda não receberam lembrete
    const now = new Date();
    const fourDaysFromNow = new Date();
    fourDaysFromNow.setDate(now.getDate() + 4);

    const pendingReminders = allInvoices.filter((invoice) => {
      const dueDate = new Date(invoice.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays === 4 && invoice.reminderSent === 0;
    });

    return pendingReminders;
  }),
});

