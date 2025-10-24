import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";

export const clientsRouter = router({
  /**
   * Lista todos os clientes
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const clients = await db.listClients(input);
      return clients;
    }),

  /**
   * Busca um cliente por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const client = await db.getClientById(input.id);
      if (!client) {
        throw new Error("Cliente não encontrado");
      }
      return client;
    }),

  /**
   * Cria um novo cliente
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        phone: z.string().optional(),
        cpfCnpj: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const client = await db.createClient(input);
      return client;
    }),

  /**
   * Atualiza um cliente
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        cpfCnpj: z.string().optional(),
        address: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const client = await db.updateClient(id, data);
      return client;
    }),
});

