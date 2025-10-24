import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { clicksignService } from "../services/clicksignService";
import { asaasService } from "../services/asaasService";
import { notificationService } from "../services/notificationService";

export const contractsRouter = router({
  /**
   * Lista todos os contratos
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "pending_signature", "active", "cancelled", "expired"]).optional(),
        clientId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const contracts = await db.listContracts(input);
      return contracts;
    }),

  /**
   * Busca um contrato por ID com todas as informações relacionadas
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const contract = await db.getContractById(input.id);
      if (!contract) {
        throw new Error("Contrato não encontrado");
      }
      return contract;
    }),

  /**
   * Cria um novo contrato
   */
  create: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        description: z.string().min(1, "Descrição é obrigatória"),
        value: z.number().min(1, "Valor deve ser maior que 0"), // em centavos
        periodicity: z.enum(["monthly", "quarterly", "semiannual", "annual"]),
        durationMonths: z.number().min(1, "Duração deve ser maior que 0"),
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Calcular data de término
      const startDate = input.startDate || new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + input.durationMonths);

      // Criar contrato
      const contract = await db.createContract({
        ...input,
        startDate,
        endDate,
        status: "draft",
      });

      return contract;
    }),

  /**
   * Envia contrato para assinatura via Clicksign
   */
  sendForSignature: protectedProcedure
    .input(
      z.object({
        contractId: z.number(),
        pdfUrl: z.string().url("URL do PDF inválida"),
      })
    )
    .mutation(async ({ input }) => {
      // Buscar contrato e cliente
      const contractData = await db.getContractById(input.contractId);
      if (!contractData) {
        throw new Error("Contrato não encontrado");
      }

      const client = await db.getClientById(contractData.contract.clientId);
      if (!client) {
        throw new Error("Cliente não encontrado");
      }

      // Criar documento no Clicksign
      const clicksignData = await clicksignService.createDocument({
        pdfPath: input.pdfUrl,
        contractId: input.contractId,
        signerName: client.name,
        signerEmail: client.email,
        signerCpf: client.cpfCnpj || undefined,
      });

      // Criar registro de assinatura
      const signature = await db.createSignature({
        contractId: input.contractId,
        clicksignEnvelopeKey: clicksignData.envelopeKey,
        clicksignDocumentKey: clicksignData.documentKey,
        status: "pending",
      });

      // Atualizar status do contrato
      await db.updateContract(input.contractId, {
        status: "pending_signature",
        pdfUrl: input.pdfUrl,
      });

      return {
        signature,
        signUrl: clicksignData.signUrl,
      };
    }),

  /**
   * Ativa um contrato após assinatura e cria assinatura recorrente no Asaas
   */
  activate: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ input }) => {
      // Buscar contrato e cliente
      const contractData = await db.getContractById(input.contractId);
      if (!contractData) {
        throw new Error("Contrato não encontrado");
      }

      const client = await db.getClientById(contractData.contract.clientId);
      if (!client) {
        throw new Error("Cliente não encontrado");
      }

      // Criar cliente no Asaas
      const asaasCustomerId = await asaasService.createCustomer({
        name: client.name,
        email: client.email,
        cpfCnpj: client.cpfCnpj || undefined,
        phone: client.phone || undefined,
      });

      // Calcular primeira data de vencimento
      const firstDueDate = contractData.contract.startDate || new Date();

      // Criar assinatura recorrente no Asaas
      const asaasSubscription = await asaasService.createSubscription({
        customerId: asaasCustomerId,
        value: contractData.contract.value,
        periodicity: contractData.contract.periodicity,
        description: contractData.contract.description,
        dueDate: firstDueDate,
      });

      // Criar registro de assinatura recorrente
      const subscription = await db.createSubscription({
        contractId: input.contractId,
        asaasSubscriptionId: asaasSubscription.subscriptionId,
        asaasCustomerId: asaasCustomerId,
        status: "active",
        nextDueDate: asaasSubscription.nextDueDate,
      });

      // Atualizar status do contrato
      await db.updateContract(input.contractId, {
        status: "active",
      });

      // Atualizar status da assinatura
      if (contractData.signature) {
        await db.updateSignature(contractData.signature.id, {
          status: "signed",
          signedAt: new Date(),
        });
      }

      // Enviar notificação de contrato assinado
      await notificationService.sendContractSigned({
        clientName: client.name,
        clientEmail: client.email,
        contractDescription: contractData.contract.description,
        pdfUrl: contractData.contract.pdfUrl || "",
      });

      return {
        contract: await db.getContractById(input.contractId),
        subscription,
      };
    }),

  /**
   * Cancela um contrato
   */
  cancel: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ input }) => {
      const contractData = await db.getContractById(input.contractId);
      if (!contractData) {
        throw new Error("Contrato não encontrado");
      }

      // Cancelar assinatura no Asaas se existir
      if (contractData.subscription?.asaasSubscriptionId) {
        await asaasService.cancelSubscription(contractData.subscription.asaasSubscriptionId);
        await db.updateSubscription(contractData.subscription.id, {
          status: "cancelled",
        });
      }

      // Cancelar documento no Clicksign se existir
      if (contractData.signature?.clicksignDocumentKey) {
        await clicksignService.cancelDocument(contractData.signature.clicksignDocumentKey);
        await db.updateSignature(contractData.signature.id, {
          status: "cancelled",
        });
      }

      // Atualizar status do contrato
      await db.updateContract(input.contractId, {
        status: "cancelled",
      });

      return await db.getContractById(input.contractId);
    }),
});

