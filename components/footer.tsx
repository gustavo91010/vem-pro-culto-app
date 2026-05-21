import { Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-primary font-bold text-sm">VPC</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Vem Pro Culto. Todos os direitos reservados.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-default">
            <Mail className="h-4 w-4" />
            <span>contato.vemproculto@gmail.com</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
