import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Clients() {
  const { isAuthenticated, loading } = useAuth();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpfCnpj: "",
    address: "",
  });

  const utils = trpc.useUtils();

  const { data: clients, isLoading } = trpc.clients.list.useQuery(
    { search },
    { enabled: isAuthenticated }
  );

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente criado com sucesso!");
      utils.clients.list.invalidate();
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", phone: "", cpfCnpj: "", address: "" });
    },
    onError: (error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

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
          <p className="text-muted-foreground">Faça login para gerenciar clientes</p>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Novo Cliente</DialogTitle>
                  <DialogDescription>Cadastre um novo cliente no sistema</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                    <Input
                      id="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Criando..." : "Criar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Clients List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : clients && clients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <CardDescription>{client.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {client.phone && (
                      <p className="text-muted-foreground">
                        <strong>Telefone:</strong> {client.phone}
                      </p>
                    )}
                    {client.cpfCnpj && (
                      <p className="text-muted-foreground">
                        <strong>CPF/CNPJ:</strong> {client.cpfCnpj}
                      </p>
                    )}
                    {client.address && (
                      <p className="text-muted-foreground">
                        <strong>Endereço:</strong> {client.address}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground pt-2">
                      Cadastrado em: {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

