"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, Church } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Activity } from "@/lib/mock-data"

const categoryImages: Record<string, string> = {
  evento: "/images/activities/evento.svg",
  jovens: "/images/activities/jovens.svg",
  estudo: "/images/activities/estudo.svg",
  musica: "/images/activities/musica.svg",
  social: "/images/activities/social.svg",
  saude: "/images/activities/saude.svg",
  criancas: "/images/activities/criancas.svg",
}

function getCategoryImage(category: string): string {
  const key = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return categoryImages[key] || categoryImages.evento
}

interface ActivityCardProps {
  activity: Activity & { churchName?: string }
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const dateObj = new Date(activity.date + "T00:00:00")
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <Link href={`/atividade/${activity.id}`} className="group block">
      <Card className="h-full overflow-hidden border border-border bg-card transition-all duration-200 hover:border-secondary/40 hover:shadow-md">
        {/* Category Image */}
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            src={getCategoryImage(activity.category)}
            alt={`Imagem de ${activity.category}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
          <Badge className="absolute top-2.5 right-2.5 bg-secondary/90 text-secondary-foreground border-0 text-xs font-medium shadow-sm">
            {activity.category}
          </Badge>
        </div>

        <CardContent className="flex flex-col gap-2.5 p-4">
          <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors leading-tight">
            {activity.name}
          </h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {activity.description}
          </p>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" />
              <span>{activity.time}</span>
            </div>
            {activity.churchName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Church className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                <span className="line-clamp-1">{activity.churchName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
