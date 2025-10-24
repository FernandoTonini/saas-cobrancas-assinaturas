import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Contracts() {
  const { isAuthenticated, loading } = useAuth();

  const { data: contracts, isLoading } = trpc.contracts.list.useQuery(undefined, {
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
          <h1 className="text-3xl font-bold">Acesso Restrito</h1>
          <p className="text-muted-foreground">Faça login para gerenciar contratos</p>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "Rascunho", variant: "secondary" },
      pending_signature: { label: "Aguardando Assinatura", variant: "outline" },
      active: { label: "Ativo", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
      expired: { label: "Expirado", variant: "destructive" },
    };

    const config = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPeriodicityLabel = (periodicity: string) => {
    const map: Record<string, string> = {
      monthly: "Mensal",
      quarterly: "Trimestral",
      semiannual: "Semestral",
      annual: "Anual",
    };
    return map[periodicity] || periodicity;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
            <p className="text-muted-foreground">Gerencie contratos e assinaturas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contracts?.filter((c) => c.contract.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contracts?.filter((c) => c.contract.status === "pending_signature").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {contracts?.filter((c) => c.contract.status === "cancelled").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando contratos...</p>
          </div>
        ) : contracts && contracts.length > 0 ? (
          <div className="space-y-4">
            {contracts.map((item) => (
              <Card key={item.contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.contract.description}</CardTitle>
                      <CardDescription>
                        Cliente ID: {item.contract.clientId} • Criado em{" "}
                        {new Date(item.contract.createdAt).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(item.contract.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Valor</p>
                      <p className="text-2xl font-bold">
                        R$ {(item.contract.value / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Periodicidade</p>
                      <p className="text-lg">{getPeriodicityLabel(item.contract.periodicity)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Duração</p>
                      <p className="text-lg">{item.contract.durationMonths} meses</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Período</p>
                      <p className="text-sm text-muted-foreground">
                        {item.contract.startDate
                          ? new Date(item.contract.startDate).toLocaleDateString("pt-BR")
                          : "—"}{" "}
                        até{" "}
                        {item.contract.endDate
                          ? new Date(item.contract.endDate).toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(item.signature || item.subscription) && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {item.signature && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Assinatura Digital:</span>
                          <Badge variant={item.signature.status === "signed" ? "default" : "secondary"}>
                            {item.signature.status === "signed" ? "Assinado" : "Pendente"}
                          </Badge>
                        </div>
                      )}
                      {item.subscription && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cobrança Recorrente:</span>
                          <Badge variant={item.subscription.status === "active" ? "default" : "secondary"}>
                            {item.subscription.status}
                          </Badge>
                        </div>
                      )}
                      {item.subscription?.nextDueDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Próximo Vencimento:</span>
                          <span>
                            {new Date(item.subscription.nextDueDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum contrato encontrado</p>
              <p className="text-sm text-muted-foreground">
                Crie um cliente primeiro e depois crie contratos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

