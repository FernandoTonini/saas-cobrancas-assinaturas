import { eq, and, desc, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  clients, InsertClient, Client,
  contracts, InsertContract, Contract,
  signatures, InsertSignature, Signature,
  subscriptions, InsertSubscription, Subscription,
  invoices, InsertInvoice, Invoice,
  notifications, InsertNotification, Notification,
  webhooksLog, InsertWebhookLog, WebhookLog,
  crmIntegration
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER HELPERS
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// CLIENT HELPERS
// ============================================

export async function createClient(data: InsertClient): Promise<Client> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(data);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(clients).where(eq(clients.id, insertId)).limit(1);
  return created[0];
}

export async function getClientById(id: number): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function listClients(filters?: { search?: string }): Promise<Client[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (filters?.search) {
    return await db.select().from(clients)
      .where(
        sql`${clients.name} LIKE ${`%${filters.search}%`} OR ${clients.email} LIKE ${`%${filters.search}%`}`
      )
      .orderBy(desc(clients.createdAt));
  }

  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function updateClient(id: number, data: Partial<InsertClient>): Promise<Client> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(data).where(eq(clients.id, id));
  
  const updated = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return updated[0];
}

// ============================================
// CONTRACT HELPERS
// ============================================

export async function createContract(data: InsertContract): Promise<Contract> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contracts).values(data);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(contracts).where(eq(contracts.id, insertId)).limit(1);
  return created[0];
}

export async function getContractById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      contract: contracts,
      signature: signatures,
      subscription: subscriptions,
    })
    .from(contracts)
    .leftJoin(signatures, eq(signatures.contractId, contracts.id))
    .leftJoin(subscriptions, eq(subscriptions.contractId, contracts.id))
    .where(eq(contracts.id, id))
    .limit(1);

  return result[0];
}

export async function listContracts(filters?: { status?: string; clientId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let conditions = [];

  if (filters?.status) {
    conditions.push(eq(contracts.status, filters.status as any));
  }

  if (filters?.clientId) {
    conditions.push(eq(contracts.clientId, filters.clientId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select({
      contract: contracts,
      signature: signatures,
      subscription: subscriptions,
    })
    .from(contracts)
    .leftJoin(signatures, eq(signatures.contractId, contracts.id))
    .leftJoin(subscriptions, eq(subscriptions.contractId, contracts.id))
    .where(whereClause)
    .orderBy(desc(contracts.createdAt));
}

export async function updateContract(id: number, data: Partial<InsertContract>): Promise<Contract> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contracts).set(data).where(eq(contracts.id, id));
  
  const updated = await db.select().from(contracts).where(eq(contracts.id, id)).limit(1);
  return updated[0];
}

// ============================================
// SIGNATURE HELPERS
// ============================================

export async function createSignature(data: InsertSignature): Promise<Signature> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(signatures).values(data);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(signatures).where(eq(signatures.id, insertId)).limit(1);
  return created[0];
}

export async function getSignatureByContractId(contractId: number): Promise<Signature | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(signatures).where(eq(signatures.contractId, contractId)).limit(1);
  return result[0];
}

export async function updateSignature(id: number, data: Partial<InsertSignature>): Promise<Signature> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(signatures).set(data).where(eq(signatures.id, id));
  
  const updated = await db.select().from(signatures).where(eq(signatures.id, id)).limit(1);
  return updated[0];
}

// ============================================
// SUBSCRIPTION HELPERS
// ============================================

export async function createSubscription(data: InsertSubscription): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(data);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(subscriptions).where(eq(subscriptions.id, insertId)).limit(1);
  return created[0];
}

export async function getSubscriptionByContractId(contractId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(subscriptions).where(eq(subscriptions.contractId, contractId)).limit(1);
  return result[0];
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
  
  const updated = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  return updated[0];
}

// ============================================
// INVOICE HELPERS
// ============================================

export async function createInvoice(data: InsertInvoice): Promise<Invoice> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(invoices).values(data);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(invoices).where(eq(invoices.id, insertId)).limit(1);
  return created[0];
}

export async function getInvoiceById(id: number): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}

export async function listInvoices(filters?: { subscriptionId?: number; status?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let conditions = [];

  if (filters?.subscriptionId) {
    conditions.push(eq(invoices.subscriptionId, filters.subscriptionId));
  }

  if (filters?.status) {
    conditions.push(eq(invoices.status, filters.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db.select().from(invoices).where(whereClause).orderBy(desc(invoices.dueDate));
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>): Promise<Invoice> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(invoices).set(data).where(eq(invoices.id, id));
  
  const updated = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return updated[0];
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

export async function createNotification(data: InsertNotification): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(data);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(notifications).where(eq(notifications.id, insertId)).limit(1);
  return created[0];
}

export async function listNotifications(filters?: { clientId?: number; invoiceId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let conditions = [];

  if (filters?.clientId) {
    conditions.push(eq(notifications.clientId, filters.clientId));
  }

  if (filters?.invoiceId) {
    conditions.push(eq(notifications.invoiceId, filters.invoiceId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db.select().from(notifications).where(whereClause).orderBy(desc(notifications.createdAt));
}

// ============================================
// WEBHOOK LOG HELPERS
// ============================================

export async function createWebhookLog(data: InsertWebhookLog): Promise<WebhookLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(webhooksLog).values(data);
  const insertId = Number(result[0].insertId);
  
  const created = await db.select().from(webhooksLog).where(eq(webhooksLog.id, insertId)).limit(1);
  return created[0];
}

// ============================================
// CRM INTEGRATION HELPERS
// ============================================

export async function getCrmIntegrationConfig() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(crmIntegration).limit(1);
  return result[0];
}

export async function updateCrmIntegrationConfig(data: { webhookUrl?: string; apiKey?: string; enabled?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getCrmIntegrationConfig();

  if (existing) {
    await db.update(crmIntegration).set(data).where(eq(crmIntegration.id, existing.id));
  } else {
    await db.insert(crmIntegration).values(data);
  }

  return await getCrmIntegrationConfig();
}

