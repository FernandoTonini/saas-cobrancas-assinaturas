import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { FileText, Users, CreditCard, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();

  // Buscar dados
  const { data: clients } = trpc.clients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: contracts } = trpc.contracts.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: invoices } = trpc.invoices.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: pendingReminders } = trpc.invoices.getPendingReminders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <h1 className="text-3xl font-bold">Plataforma SaaS de Cobranças</h1>
          <p className="text-muted-foreground">Faça login para acessar o dashboard</p>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      title: "Clientes",
      value: clients?.length || 0,
      description: "Total de clientes cadastrados",
      icon: Users,
      href: "/clients",
    },
    {
      title: "Contratos Ativos",
      value: contracts?.filter((c) => c.contract.status === "active").length || 0,
      description: "Contratos em andamento",
      icon: FileText,
      href: "/contracts",
    },
    {
      title: "Faturas Pendentes",
      value: invoices?.filter((i) => i.status === "pending").length || 0,
      description: "Aguardando pagamento",
      icon: CreditCard,
      href: "/invoices",
    },
    {
      title: "Lembretes Pendentes",
      value: pendingReminders?.length || 0,
      description: "Faturas que precisam de lembrete",
      icon: AlertCircle,
      href: "/invoices",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da plataforma de cobranças e assinaturas
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Contratos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Contratos Recentes</CardTitle>
              <CardDescription>Últimos contratos criados</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts && contracts.length > 0 ? (
                <div className="space-y-4">
                  {contracts.slice(0, 5).map((item) => (
                    <div key={item.contract.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.contract.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {item.contract.status}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        R$ {(item.contract.value / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum contrato encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* Faturas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Faturas Recentes</CardTitle>
              <CardDescription>Últimas faturas geradas</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          Vencimento: {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">Status: {invoice.status}</p>
                      </div>
                      <div className="text-sm font-medium">
                        R$ {(invoice.value / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma fatura encontrada</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/clients">Novo Cliente</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contracts">Novo Contrato</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/invoices">Ver Faturas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

