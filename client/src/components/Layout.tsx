import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Clientes", href: "/clients" },
    { name: "Contratos", href: "/contracts" },
    { name: "Faturas", href: "/invoices" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                {APP_LOGO && (
                  <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
                )}
                <span className="text-xl font-bold">{APP_TITLE}</span>
              </div>
            </Link>

            {/* Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-6">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        location === item.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user?.name || user?.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => logout()}>
                    Sair
                  </Button>
                </>
              ) : (
                <Button size="sm" asChild>
                  <a href={getLoginUrl()}>Entrar</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

