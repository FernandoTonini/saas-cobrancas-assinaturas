# 🚀 Guia de Deploy - SaaS Cobranças e Assinaturas

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Vercel (gratuita)
- ✅ Conta no Railway (gratuita)
- ✅ Node.js 18+ instalado

---

## 🎯 Passo 1: Preparar Repositório GitHub

### 1.1 Criar Repositório

1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome sugerido: `saas-cobrancas-assinaturas`
4. Deixe como **Private** (recomendado)
5. NÃO inicialize com README
6. Clique em "Create repository"

### 1.2 Fazer Upload do Código

```bash
# Navegue até a pasta do projeto
cd /caminho/para/saas-cobrancas-export

# Inicialize git
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: SaaS Cobranças e Assinaturas"

# Conecte ao repositório remoto
git remote add origin https://github.com/SEU-USUARIO/saas-cobrancas-assinaturas.git

# Envie o código
git branch -M main
git push -u origin main
```

---

## 🗄️ Passo 2: Deploy do Banco de Dados (Railway)

### 2.1 Criar Projeto

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Provision PostgreSQL"**
5. Aguarde a criação (leva ~30 segundos)

### 2.2 Copiar DATABASE_URL

1. Clique no serviço PostgreSQL criado
2. Vá em **"Connect"**
3. Copie a **"Postgres Connection URL"**
4. Formato: `postgresql://user:pass@host:port/database`
5. **Guarde essa URL**, você vai precisar!

### 2.3 Criar Tabelas

**Opção A: Via Railway Query (Recomendado)**

1. No Railway, clique em **"Query"**
2. Cole o SQL abaixo e execute:

```sql
-- Criar tabelas
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cpf_cnpj VARCHAR(18),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  description TEXT NOT NULL,
  value INTEGER NOT NULL,
  periodicity VARCHAR(20) NOT NULL,
  duration_months INTEGER NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE signatures (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id),
  clicksign_envelope_key VARCHAR(255),
  clicksign_document_key VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL REFERENCES contracts(id),
  asaas_subscription_id VARCHAR(255),
  asaas_customer_id VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  next_due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  subscription_id INTEGER NOT NULL REFERENCES subscriptions(id),
  asaas_invoice_id VARCHAR(255),
  value INTEGER NOT NULL,
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reminder_sent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  invoice_id INTEGER REFERENCES invoices(id),
  type VARCHAR(20) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE webhooks_log (
  id SERIAL PRIMARY KEY,
  event VARCHAR(50) NOT NULL,
  payload TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  response TEXT,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE ai_interactions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  type VARCHAR(50) NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  model VARCHAR(50),
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE crm_config (
  id SERIAL PRIMARY KEY,
  webhook_url VARCHAR(500),
  webhook_secret VARCHAR(255),
  api_key VARCHAR(255),
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Opção B: Via Drizzle (Localmente)**

```bash
# Configure DATABASE_URL no .env
echo "DATABASE_URL=sua-url-aqui" > .env

# Instale dependências
npm install

# Execute migrations
npm run db:push
```

---

## 🖥️ Passo 3: Deploy do Backend (Railway)

### 3.1 Adicionar Backend ao Projeto

1. No Railway, clique em **"New Service"**
2. Selecione **"GitHub Repo"**
3. Conecte seu repositório `saas-cobrancas-assinaturas`
4. Railway detectará automaticamente o projeto Node.js

### 3.2 Configurar Variáveis de Ambiente

1. Clique no serviço backend criado
2. Vá em **"Variables"**
3. Adicione as seguintes variáveis:

```
DATABASE_URL=<cole-a-url-do-passo-2.2>
JWT_SECRET=<gere-um-aleatorio-abaixo>
PORT=3000
NODE_ENV=production
```

**Gerar JWT_SECRET:**
```bash
# No terminal
openssl rand -base64 32
```

### 3.3 Configurar Build

Railway deve detectar automaticamente, mas se precisar:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 3.4 Deploy

1. Railway fará deploy automaticamente
2. Aguarde ~2-3 minutos
3. Copie a **URL pública** gerada (ex: `https://saas-cobrancas-production.up.railway.app`)

---

## 🌐 Passo 4: Deploy do Frontend (Vercel)

### 4.1 Importar Projeto

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `saas-cobrancas-assinaturas`
5. Clique em **"Import"**

### 4.2 Configurar Build

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4.3 Adicionar Variáveis de Ambiente

Clique em **"Environment Variables"** e adicione:

```
VITE_API_URL=<url-do-backend-railway>
```

Exemplo: `https://saas-cobrancas-production.up.railway.app`

### 4.4 Deploy

1. Clique em **"Deploy"**
2. Aguarde ~2 minutos
3. Vercel vai gerar uma URL (ex: `https://saas-cobrancas.vercel.app`)

---

## 🔧 Passo 5: Configurar Integrações (Opcional)

### 5.1 OpenAI (IA)

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma API Key
3. No Railway, adicione variável:
   ```
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

### 5.2 Clicksign

1. Crie conta em [clicksign.com](https://www.clicksign.com)
2. Acesse Configurações → API
3. No Railway, adicione:
   ```
   CLICKSIGN_API_KEY=sua-key
   CLICKSIGN_BASE_URL=https://api.clicksign.com/v3
   ```

### 5.3 Asaas

1. Crie conta em [asaas.com](https://www.asaas.com)
2. Use sandbox: [sandbox.asaas.com](https://sandbox.asaas.com)
3. No Railway, adicione:
   ```
   ASAAS_API_KEY=sua-key
   ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3
   ```

### 5.4 Twilio (SMS/WhatsApp)

1. Crie conta em [twilio.com](https://www.twilio.com)
2. No Railway, adicione:
   ```
   TWILIO_ACCOUNT_SID=ACxxx
   TWILIO_AUTH_TOKEN=xxx
   TWILIO_PHONE_NUMBER=+5511999999999
   TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999
   ```

### 5.5 SendGrid (Email)

1. Crie conta em [sendgrid.com](https://sendgrid.com)
2. No Railway, adicione:
   ```
   SENDGRID_API_KEY=SG.xxx
   SENDGRID_FROM_EMAIL=noreply@seudominio.com
   ```

---

## 🔗 Passo 6: Integrar com CRM

### 6.1 Criar Endpoint no CRM (Render)

No seu CRM, adicione este endpoint:

```javascript
// server/routes/webhooks.js
app.post('/api/webhooks/contrato-assinado', async (req, res) => {
  try {
    // Validar secret
    const secret = req.headers['x-webhook-secret'];
    if (secret !== process.env.CRM_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { evento, cliente, contrato, assinatura } = req.body;

    // Salvar no TiDB
    await db.query(`
      INSERT INTO contratos (
        cliente_nome, cliente_email, descricao, valor,
        periodicidade, duracao_meses, data_inicio, data_fim,
        servicos, documento_url, assinado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cliente.nome,
      cliente.email,
      contrato.descricao,
      contrato.valor,
      contrato.periodicidade,
      contrato.duracao_meses,
      contrato.data_inicio,
      contrato.data_fim,
      JSON.stringify(contrato.servicos),
      assinatura.documento_url,
      assinatura.assinado_em
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### 6.2 Configurar no SaaS

No Railway (backend do SaaS), adicione:

```
CRM_WEBHOOK_URL=https://crm-agencia-api.onrender.com/api/webhooks/contrato-assinado
CRM_WEBHOOK_SECRET=<gere-um-secret-aleatorio>
```

### 6.3 Configurar no CRM

No Render (CRM), adicione a variável:

```
CRM_WEBHOOK_SECRET=<mesmo-secret-do-passo-anterior>
```

---

## ✅ Passo 7: Testar Tudo

### 7.1 Acessar Frontend

1. Abra a URL do Vercel
2. Faça login
3. Teste criar um cliente

### 7.2 Testar Webhook

1. Crie um contrato
2. "Assine" o contrato (modo mock)
3. Verifique se apareceu no CRM

### 7.3 Testar IA (se configurou OpenAI)

1. Use a função de gerar contrato
2. Verifique a análise de risco

---

## 🎉 Pronto!

Sua plataforma está no ar! URLs:

- **Frontend**: `https://seu-projeto.vercel.app`
- **Backend**: `https://seu-projeto.up.railway.app`
- **CRM**: `https://crm-agencia-api.onrender.com`

---

## 📊 Monitoramento

### Railway
- Logs: Railway → Seu Projeto → Logs
- Métricas: Railway → Seu Projeto → Metrics

### Vercel
- Analytics: Vercel → Seu Projeto → Analytics
- Logs: Vercel → Seu Projeto → Deployments → Logs

---

## 🔄 Atualizações

Para atualizar o código:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

Railway e Vercel farão deploy automaticamente!

---

## 💰 Custos

- **Vercel**: Gratuito
- **Railway**: $5/mês de crédito grátis
- **Total**: R$ 0-25/mês

---

## 🆘 Problemas Comuns

### Erro de conexão com banco
- Verifique se DATABASE_URL está correta
- Teste conexão no Railway Query

### Frontend não conecta ao backend
- Verifique VITE_API_URL no Vercel
- Adicione CORS no backend

### Webhook não funciona
- Verifique CRM_WEBHOOK_SECRET
- Teste endpoint manualmente com Postman

---

**Dúvidas? Consulte o README.md ou abra uma issue!**

