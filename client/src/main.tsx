import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  const [status, setStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(import.meta.env.VITE_API_URL || 'https://saas-cobrancas-api.onrender.com')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚀 SaaS de Cobranças e Assinaturas Digitais</h1>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h2>Status da API</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : status ? (
          <div>
            <p>✅ <strong>Status:</strong> {status.status}</p>
            <p>📦 <strong>Mensagem:</strong> {status.message}</p>
            <p>🔢 <strong>Versão:</strong> {status.version}</p>
          </div>
        ) : (
          <p>❌ Erro ao conectar com a API</p>
        )}
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>📋 Funcionalidades</h2>
        <ul>
          <li>✅ Backend funcionando (Node.js + Express)</li>
          <li>✅ Banco de dados PostgreSQL (Neon)</li>
          <li>✅ API REST disponível</li>
          <li>⏳ Frontend em desenvolvimento</li>
          <li>⏳ Integração com Clicksign (Assinatura Digital)</li>
          <li>⏳ Integração com Asaas (Cobranças)</li>
          <li>⏳ Integração com IA (OpenAI)</li>
          <li>⏳ Webhook para CRM</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>🔗 Links Úteis</h3>
        <ul>
          <li><a href="https://saas-cobrancas-api.onrender.com" target="_blank" rel="noopener noreferrer">API Backend</a></li>
          <li><a href="https://saas-cobrancas-api.onrender.com/health" target="_blank" rel="noopener noreferrer">Health Check</a></li>
          <li><a href="https://github.com/FernandoTonini/saas-cobrancas-assinaturas" target="_blank" rel="noopener noreferrer">Repositório GitHub</a></li>
        </ul>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>⚙️ Próximos Passos</h3>
        <ol>
          <li>Configurar APIs externas (Clicksign, Asaas, OpenAI)</li>
          <li>Desenvolver interface de usuário completa</li>
          <li>Implementar autenticação</li>
          <li>Criar dashboard de estatísticas</li>
          <li>Configurar webhook para integração com CRM</li>
        </ol>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
