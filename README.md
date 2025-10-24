# 🚀 SaaS de Cobranças e Assinaturas Digitais

Plataforma completa para gestão de cobranças recorrentes, assinaturas digitais e notificações automáticas, com integração de IA e webhook para CRM.

## 📋 Funcionalidades

### ✅ Gestão de Clientes
- CRUD completo de clientes
- Busca e filtros
- Histórico de contratos

### ✅ Contratos e Assinaturas Digitais
- Criação de contratos personalizados
- Integração com Clicksign para assinatura eletrônica
- Geração automática de contratos com IA (OpenAI)
- Análise inteligente de cláusulas

### ✅ Cobranças Recorrentes
- Integração com Asaas
- Geração automática de faturas
- Múltiplas periodicidades (mensal, trimestral, semestral, anual)
- Previsão de inadimplência com IA

### ✅ Notificações Multi-Canal
- Email (SendGrid)
- SMS (Twilio)
- WhatsApp (Twilio)
- Lembretes automáticos 4 dias antes do vencimento

### ✅ Integração com CRM
- Webhook automático quando contrato é assinado
- Sincronização em tempo real
- Dados completos do contrato enviados ao CRM

### ✅ Inteligência Artificial
- Geração automática de contratos
- Análise de risco de inadimplência
- Chatbot para atendimento ao cliente
- Sugestões de valores baseadas em histórico

---

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + tRPC
- **Banco de Dados**: PostgreSQL (Railway)
- **ORM**: Drizzle ORM
- **IA**: OpenAI GPT-4
- **Deploy**: Vercel (frontend) + Railway (backend + banco)

### Integrações
- **Clicksign**: Assinatura digital de contratos
- **Asaas**: Cobranças e pagamentos recorrentes
- **Twilio**: SMS e WhatsApp
- **SendGrid**: Envio de emails
- **OpenAI**: Funcionalidades de IA

---

## 🚀 Deploy

### Pré-requisitos
- Conta no GitHub
- Conta no Vercel (gratuita)
- Conta no Railway (gratuita)
- Node.js 18+ instalado localmente

### Passo 1: Criar Repositório no GitHub

```bash
# Clone este projeto
git clone <url-do-projeto>
cd saas-cobrancas-assinaturas

# Inicialize git (se ainda não estiver)
git init
git add .
git commit -m "Initial commit"

# Crie um novo repositório no GitHub e conecte
git remote add origin https://github.com/SEU-USUARIO/saas-cobrancas.git
git branch -M main
git push -u origin main
```

### Passo 2: Deploy do Banco de Dados (Railway)

1. Acesse [Railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Provision PostgreSQL"
4. Copie a `DATABASE_URL` que será gerada
5. Guarde para usar no próximo passo

### Passo 3: Deploy do Backend (Railway)

1. No mesmo projeto do Railway, clique em "New Service"
2. Selecione "GitHub Repo"
3. Conecte seu repositório
4. Configure as variáveis de ambiente (veja `.env.example`)
5. Railway vai fazer deploy automaticamente

**Variáveis de Ambiente Obrigatórias:**
```
DATABASE_URL=<copiado-do-passo-2>
JWT_SECRET=<gere-um-aleatório>
PORT=3000
NODE_ENV=production
```

### Passo 4: Deploy do Frontend (Vercel)

1. Acesse [Vercel.com](https://vercel.com)
2. Clique em "Import Project"
3. Conecte seu repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Adicione variável de ambiente:
   ```
   VITE_API_URL=<url-do-backend-railway>
   ```
6. Deploy!

### Passo 5: Configurar Banco de Dados

```bash
# Localmente, com DATABASE_URL configurada
npm install
npm run db:push
```

Ou acesse Railway → PostgreSQL → Query e execute o schema SQL.

---

## 🔧 Configuração das Integrações

### OpenAI (IA)
1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma API Key
3. Adicione `OPENAI_API_KEY` nas variáveis de ambiente

### Clicksign (Assinatura Digital)
1. Crie conta em [clicksign.com](https://www.clicksign.com)
2. Acesse Configurações → API
3. Copie a API Key
4. Adicione `CLICKSIGN_API_KEY` nas variáveis

### Asaas (Cobranças)
1. Crie conta em [asaas.com](https://www.asaas.com)
2. Use sandbox para testes: [sandbox.asaas.com](https://sandbox.asaas.com)
3. Acesse Integrações → API
4. Copie a API Key
5. Adicione `ASAAS_API_KEY` e `ASAAS_BASE_URL`

### Twilio (SMS/WhatsApp)
1. Crie conta em [twilio.com](https://www.twilio.com)
2. Copie Account SID e Auth Token
3. Configure um número de telefone
4. Configure WhatsApp Business
5. Adicione as variáveis `TWILIO_*`

### SendGrid (Email)
1. Crie conta em [sendgrid.com](https://sendgrid.com)
2. Crie uma API Key
3. Verifique um email remetente
4. Adicione `SENDGRID_API_KEY` e `SENDGRID_FROM_EMAIL`

---

## 🔗 Integração com CRM

### Configurar Webhook no CRM

No seu CRM (Render), crie um endpoint para receber os dados:

```javascript
// server/routes/webhooks.js
app.post('/api/webhooks/contrato-assinado', async (req, res) => {
  const { evento, cliente, contrato, assinatura } = req.body;
  
  // Validar secret
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.CRM_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Salvar no banco TiDB
  await db.contratos.create({
    cliente_nome: cliente.nome,
    cliente_email: cliente.email,
    descricao: contrato.descricao,
    valor: contrato.valor,
    periodicidade: contrato.periodicidade,
    duracao_meses: contrato.duracao_meses,
    data_inicio: contrato.data_inicio,
    data_fim: contrato.data_fim,
    servicos: JSON.stringify(contrato.servicos),
    documento_url: assinatura.documento_url,
    assinado_em: assinatura.assinado_em,
  });
  
  res.json({ success: true });
});
```

### Configurar no SaaS

Adicione nas variáveis de ambiente do Railway:

```
CRM_WEBHOOK_URL=https://crm-agencia-api.onrender.com/api/webhooks/contrato-assinado
CRM_WEBHOOK_SECRET=seu-secret-aqui
```

---

## 🤖 Funcionalidades de IA

### 1. Geração Automática de Contratos

```typescript
// Exemplo de uso
const contratoGerado = await aiService.generateContract({
  clienteNome: "João Silva",
  servico: "Gestão de Tráfego Pago",
  valor: 1500,
  duracao: 12
});
```

### 2. Análise de Risco

```typescript
const risco = await aiService.analyzeRisk({
  clienteId: 123,
  historicoPagamentos: [...]
});
// Retorna: { risco: "baixo" | "medio" | "alto", score: 0-100 }
```

### 3. Chatbot

```typescript
const resposta = await aiService.chatbot({
  pergunta: "Quando vence minha próxima fatura?",
  clienteId: 123
});
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- `clients` - Clientes cadastrados
- `contracts` - Contratos criados
- `signatures` - Assinaturas digitais (Clicksign)
- `subscriptions` - Assinaturas recorrentes (Asaas)
- `invoices` - Faturas geradas
- `notifications` - Histórico de notificações
- `webhooks_log` - Log de webhooks enviados
- `ai_interactions` - Histórico de interações com IA

---

## 🔒 Segurança

- ✅ JWT para autenticação
- ✅ Variáveis de ambiente para secrets
- ✅ Validação de webhooks com secret
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Sanitização de inputs

---

## 💰 Custos Estimados

### Gratuito (até certos limites)
- **Vercel**: Frontend ilimitado
- **Railway**: 500MB PostgreSQL + $5/mês de crédito
- **GitHub**: Repositórios ilimitados

### Pago (conforme uso)
- **OpenAI**: ~$0.002 por 1K tokens (GPT-4)
- **Clicksign**: A partir de R$ 49/mês
- **Asaas**: 1,49% por transação
- **Twilio**: ~$0.0075 por SMS
- **SendGrid**: Gratuito até 100 emails/dia

**Total estimado**: R$ 0-150/mês dependendo do uso

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Abra uma issue no GitHub
2. Consulte a documentação das APIs integradas
3. Entre em contato com o desenvolvedor

---

## 📝 Licença

MIT License - Você tem 100% de controle e pode modificar como quiser!

---

## 🎯 Próximos Passos

1. ✅ Deploy no Vercel + Railway
2. ✅ Configurar integrações (Clicksign, Asaas, etc)
3. ✅ Configurar webhook do CRM
4. ✅ Testar fluxo completo
5. ✅ Adicionar domínio personalizado (opcional)
6. ✅ Configurar monitoramento (Sentry, LogRocket, etc)

---

**Desenvolvido com ❤️ para automatizar cobranças e assinaturas**

