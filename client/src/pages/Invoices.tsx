import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { CreditCard, CheckCircle, Clock, AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function Invoices() {
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const { data: invoices, isLoading } = trpc.invoices.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const markAsPaidMutation = trpc.invoices.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success("Fatura marcada como paga!");
      utils.invoices.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const sendReminderMutation = trpc.invoices.sendReminder.useMutation({
    onSuccess: () => {
      toast.success("Lembrete enviado com sucesso!");
      utils.invoices.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
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
          <p className="text-muted-foreground">Faça login para gerenciar faturas</p>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "outline" },
      paid: { label: "Pago", variant: "default" },
      overdue: { label: "Vencido", variant: "destructive" },
      cancelled: { label: "Cancelado", variant: "secondary" },
    };

    const config = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isOverdue = (dueDate: Date, status: string) => {
    return status === "pending" && new Date(dueDate) < new Date();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Faturas</h1>
            <p className="text-muted-foreground">Gerencie cobranças e pagamentos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices?.filter((i) => i.status === "paid").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices?.filter((i) => i.status === "pending").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices?.filter((i) => isOverdue(i.dueDate, i.status)).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando faturas...</p>
          </div>
        ) : invoices && invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const overdueFlag = isOverdue(invoice.dueDate, invoice.status);
              return (
                <Card key={invoice.id} className={overdueFlag ? "border-red-300" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Fatura #{invoice.id}
                        </CardTitle>
                        <CardDescription>
                          Assinatura ID: {invoice.subscriptionId}
                        </CardDescription>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-sm font-medium">Valor</p>
                        <p className="text-2xl font-bold">
                          R$ {(invoice.value / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Vencimento</p>
                        <p className={`text-lg ${overdueFlag ? "text-red-600 font-semibold" : ""}`}>
                          {new Date(invoice.dueDate).toLocaleDateString("pt-BR")}
                        </p>
                        {overdueFlag && (
                          <p className="text-xs text-red-600">Vencida!</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Lembrete</p>
                        <p className="text-lg">
                          {invoice.reminderSent ? "Enviado" : "Não enviado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pagamento</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.paidAt
                            ? new Date(invoice.paidAt).toLocaleDateString("pt-BR")
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {invoice.status === "pending" && (
                      <div className="mt-4 pt-4 border-t flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => markAsPaidMutation.mutate({ invoiceId: invoice.id })}
                          disabled={markAsPaidMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar como Paga
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendReminderMutation.mutate({ invoiceId: invoice.id })}
                          disabled={sendReminderMutation.isPending}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Lembrete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
              <CreditCard className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
              <p className="text-sm text-muted-foreground">
                Faturas são geradas automaticamente após ativar contratos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

