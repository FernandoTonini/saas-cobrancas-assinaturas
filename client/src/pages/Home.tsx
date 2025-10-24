import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { FileText, CreditCard, Bell, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: FileText,
      title: "Assinatura Digital",
      description: "Integração com Clicksign para assinatura eletrônica de contratos",
    },
    {
      icon: CreditCard,
      title: "Cobranças Recorrentes",
      description: "Geração automática de faturas com integração Asaas",
    },
    {
      icon: Bell,
      title: "Notificações Multi-Canal",
      description: "Lembretes via Email, SMS e WhatsApp",
    },
    {
      icon: CheckCircle,
      title: "Gestão Completa",
      description: "Dashboard para acompanhar clientes, contratos e pagamentos",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user?.name || user?.email}
                  </span>
                  <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <a href={getLoginUrl()}>Entrar</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Plataforma SaaS de Cobranças e Assinaturas
          </h1>
          <p className="text-xl text-muted-foreground">
            Automatize cobranças recorrentes, assinaturas digitais e notificações em uma única
            plataforma integrada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Acessar Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <a href={getLoginUrl()}>
                    Começar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">Saiba Mais</a>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Funcionalidades</h2>
            <p className="text-lg text-muted-foreground">
              Tudo que você precisa para gerenciar cobranças e assinaturas
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Como Funciona</h2>
            <p className="text-lg text-muted-foreground">Simples e automatizado</p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Cadastre seus clientes</h3>
                <p className="text-muted-foreground">
                  Adicione informações básicas dos clientes na plataforma
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Crie contratos e envie para assinatura</h3>
                <p className="text-muted-foreground">
                  Gere contratos e envie automaticamente via Clicksign para assinatura digital
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Ative cobranças recorrentes</h3>
                <p className="text-muted-foreground">
                  Após assinatura, o sistema cria automaticamente cobranças recorrentes no Asaas
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Receba notificações automáticas</h3>
                <p className="text-muted-foreground">
                  Lembretes são enviados 4 dias antes do vencimento via Email, SMS e WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Pronto para começar?</CardTitle>
            <CardDescription className="text-lg">
              Automatize suas cobranças e assinaturas hoje mesmo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Ir para Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>{APP_TITLE} - Plataforma SaaS de Cobranças e Assinaturas</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

