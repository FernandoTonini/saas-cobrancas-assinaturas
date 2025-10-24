import { pgTable, serial, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';

// Tabela de clientes
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  cpfCnpj: varchar('cpf_cnpj', { length: 18 }),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de contratos
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  description: text('description').notNull(),
  value: integer('value').notNull(), // em centavos
  periodicity: varchar('periodicity', { length: 20 }).notNull(), // monthly, quarterly, semiannual, annual
  durationMonths: integer('duration_months').notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: varchar('status', { length: 20 }).notNull().default('draft'), // draft, pending_signature, active, cancelled, expired
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de assinaturas digitais (Clicksign)
export const signatures = pgTable('signatures', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id').notNull().references(() => contracts.id),
  clicksignEnvelopeKey: varchar('clicksign_envelope_key', { length: 255 }),
  clicksignDocumentKey: varchar('clicksign_document_key', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, signed, cancelled
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de assinaturas recorrentes (Asaas)
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id').notNull().references(() => contracts.id),
  asaasSubscriptionId: varchar('asaas_subscription_id', { length: 255 }),
  asaasCustomerId: varchar('asaas_customer_id', { length: 255 }),
  status: varchar('status', { length: 20 }).notNull().default('active'), // active, cancelled, suspended
  nextDueDate: timestamp('next_due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de faturas
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  subscriptionId: integer('subscription_id').notNull().references(() => subscriptions.id),
  asaasInvoiceId: varchar('asaas_invoice_id', { length: 255 }),
  value: integer('value').notNull(), // em centavos
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, paid, overdue, cancelled
  reminderSent: integer('reminder_sent').notNull().default(0), // 0 = não enviado, 1 = enviado
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabela de notificações
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  invoiceId: integer('invoice_id').references(() => invoices.id),
  type: varchar('type', { length: 20 }).notNull(), // email, sms, whatsapp
  purpose: varchar('purpose', { length: 50 }).notNull(), // reminder, confirmation, alert
  status: varchar('status', { length: 20 }).notNull(), // sent, failed, pending
  message: text('message'),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de log de webhooks
export const webhooksLog = pgTable('webhooks_log', {
  id: serial('id').primaryKey(),
  event: varchar('event', { length: 50 }).notNull(),
  payload: text('payload').notNull(),
  status: varchar('status', { length: 20 }).notNull(), // success, error
  response: text('response'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de interações com IA
export const aiInteractions = pgTable('ai_interactions', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => clients.id),
  type: varchar('type', { length: 50 }).notNull(), // contract_generation, risk_analysis, chatbot
  input: text('input').notNull(),
  output: text('output').notNull(),
  model: varchar('model', { length: 50 }),
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tabela de configuração do CRM
export const crmConfig = pgTable('crm_config', {
  id: serial('id').primaryKey(),
  webhookUrl: varchar('webhook_url', { length: 500 }),
  webhookSecret: varchar('webhook_secret', { length: 255 }),
  apiKey: varchar('api_key', { length: 255 }),
  enabled: integer('enabled').notNull().default(1), // 0 = desabilitado, 1 = habilitado
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tipos TypeScript
export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

export type Signature = typeof signatures.$inferSelect;
export type InsertSignature = typeof signatures.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type WebhookLog = typeof webhooksLog.$inferSelect;
export type InsertWebhookLog = typeof webhooksLog.$inferInsert;

export type AIInteraction = typeof aiInteractions.$inferSelect;
export type InsertAIInteraction = typeof aiInteractions.$inferInsert;

export type CRMConfig = typeof crmConfig.$inferSelect;
export type InsertCRMConfig = typeof crmConfig.$inferInsert;

