export interface Activity {
  id: string
  churchId: string
  name: string
  description: string
  date: string
  time: string
  category: string
}

export interface Church {
  id: string
  name: string
  razaoSocial: string
  address: string
  city: string
  neighborhood: string
  phone: string
  email: string
  website: string
  lat: number
  lng: number
  description: string
  activities: Activity[]
  imageUrl: string
}

import { Role } from "./enums/role"

export interface User {
  id: string
  name: string
  email: string
  password: string
  roles: Role[]
  igrejasFavoritas?: number[]
}

export const users: User[] = [
  {
    id: "1",
    name: "Admin Igreja",
    email: "admin@igrejas.com",
    password: "admin123",
    roles: [Role.ADMIN],
  },
  {
    id: "2",
    name: "Maria Silva",
    email: "maria@email.com",
    password: "user123",
    roles: [Role.USER],
  },
]

export const churches: Church[] = [
  {
    id: "1",
    name: "Igreja Batista Central",
    razaoSocial: "Igreja Batista Central",
    address: "Rua Augusta, 1200",
    city: "Sao Paulo",
    neighborhood: "Consolacao",
    phone: "(11) 3256-7890",
    email: "contato@batistacentralsp.com.br",
    website: "www.batistacentralsp.com.br",
    lat: -23.5536,
    lng: -46.6569,
    description:
      "A Igreja Batista Central e uma comunidade acolhedora localizada no coracao de Sao Paulo. Com mais de 50 anos de historia, oferecemos cultos vibrantes, programas para todas as idades e uma comunidade dedicada ao servico e ao amor ao proximo.",
    imageUrl: "/images/churches/igreja-batista-central.jpg",
    activities: [
      {
        id: "a1",
        churchId: "1",
        name: "Grupo de Jovens",
        description:
          "Encontro semanal para jovens de 15 a 30 anos com louvor, estudo e comunhao.",
        date: "2026-02-21",
        time: "19:00",
        category: "Jovens",
      },
      {
        id: "a2",
        churchId: "1",
        name: "Bazar Solidario",
        description:
          "Bazar beneficente com roupas, acessorios e alimentos. Toda arrecadacao sera destinada a instituicoes de caridade.",
        date: "2026-03-15",
        time: "10:00",
        category: "Evento",
      },
    ],
  },
  {
    id: "2",
    name: "Comunidade Evangelica Esperanca",
    razaoSocial: "Comunidade Evangelica Esperanca",
    address: "Av. Paulista, 900",
    city: "Sao Paulo",
    neighborhood: "Bela Vista",
    phone: "(11) 3145-6789",
    email: "contato@ceesperanca.com.br",
    website: "www.ceesperanca.com.br",
    lat: -23.5613,
    lng: -46.6558,
    description:
      "A Comunidade Evangelica Esperanca nasceu com o proposito de ser um lugar de acolhimento e transformacao. Nossos cultos sao marcados por louvor contemporaneo e mensagens relevantes para o dia a dia.",
    imageUrl: "/images/churches/comunidade-evangelica-esperanca.jpg",
    activities: [
      {
        id: "a3",
        churchId: "2",
        name: "Estudo Biblico para Casais",
        description:
          "Encontro semanal voltado para casais que desejam fortalecer seus relacionamentos a luz da Biblia.",
        date: "2026-02-22",
        time: "20:00",
        category: "Estudo",
      },
    ],
  },
  {
    id: "3",
    name: "Igreja Presbiteriana Renovada",
    razaoSocial: "Igreja Presbiteriana Renovada",
    address: "Rua Oscar Freire, 500",
    city: "Sao Paulo",
    neighborhood: "Pinheiros",
    phone: "(11) 3078-1234",
    email: "contato@iprenovada.org",
    website: "www.iprenovada.org",
    lat: -23.5617,
    lng: -46.6722,
    description:
      "Com uma abordagem teologica solida e contemporanea, a Igreja Presbiteriana Renovada busca conectar fe e vida pratica, com enfase na formacao de discipulos.",
    imageUrl: "/images/churches/igreja-presbiteriana-renovada.jpg",
    activities: [
      {
        id: "a4",
        churchId: "3",
        name: "Retiro de Carnaval",
        description:
          "Retiro espiritual durante o feriado de Carnaval com palestras, louvor e atividades ao ar livre.",
        date: "2026-02-14",
        time: "08:00",
        category: "Evento",
      },
      {
        id: "a5",
        churchId: "3",
        name: "Coral da Igreja",
        description:
          "Ensaio do coral aberto a todos que desejam participar. Nao e necessario experiencia previa.",
        date: "2026-02-20",
        time: "19:00",
        category: "Musica",
      },
    ],
  },
  {
    id: "4",
    name: "Igreja Metodista de Copacabana",
    razaoSocial: "Igreja Metodista de Copacabana",
    address: "Rua Barata Ribeiro, 350",
    city: "Rio de Janeiro",
    neighborhood: "Copacabana",
    phone: "(21) 2548-9012",
    email: "contato@metodistacopacabana.com.br",
    website: "www.metodistacopacabana.com.br",
    lat: -22.9655,
    lng: -43.1784,
    description:
      "Localizada no coracao de Copacabana, nossa igreja e um oasis de paz na cidade maravilhosa. Oferecemos cultos acolhedores e projetos sociais para a comunidade.",
    imageUrl: "/images/churches/igreja-metodista-copacabana.jpg",
    activities: [
      {
        id: "a6",
        churchId: "4",
        name: "Acao Social na Comunidade",
        description:
          "Distribuicao de cestas basicas e atendimento medico gratuito para moradores da regiao.",
        date: "2026-03-01",
        time: "09:00",
        category: "Social",
      },
    ],
  },
  {
    id: "5",
    name: "Assembleia de Deus Madureira",
    razaoSocial: "Assembleia de Deus Madureira",
    address: "Rua Conde de Bonfim, 800",
    city: "Rio de Janeiro",
    neighborhood: "Tijuca",
    phone: "(21) 2567-3456",
    email: "contato@admadureira.org",
    website: "www.admadureira.org",
    lat: -22.9239,
    lng: -43.2344,
    description:
      "Uma das maiores congregacoes do Rio de Janeiro, a Assembleia de Deus Madureira e conhecida por seus cultos poderosos e pela dedicacao ao evangelismo e missoes.",
    imageUrl: "/images/churches/assembleia-de-deus-madureira.jpg",
    activities: [
      {
        id: "a7",
        churchId: "5",
        name: "Conferencia de Missoes",
        description:
          "Conferencia anual de missoes com missionarios convidados de diversas partes do mundo.",
        date: "2026-04-10",
        time: "19:00",
        category: "Evento",
      },
      {
        id: "a8",
        churchId: "5",
        name: "Escola Biblica de Ferias",
        description:
          "Programa especial para criancas durante as ferias com atividades ludicas e ensino biblico.",
        date: "2026-07-06",
        time: "14:00",
        category: "Criancas",
      },
    ],
  },
  {
    id: "6",
    name: "Igreja Adventista do Setimo Dia",
    razaoSocial: "Igreja Adventista do Setimo Dia",
    address: "Rua das Laranjeiras, 120",
    city: "Rio de Janeiro",
    neighborhood: "Laranjeiras",
    phone: "(21) 2225-4567",
    email: "contato@iasdlaranjeiras.com.br",
    website: "www.iasdlaranjeiras.com.br",
    lat: -22.9344,
    lng: -43.1814,
    description:
      "A Igreja Adventista de Laranjeiras promove saude integral, educacao e servico comunitario, com cultos aos sabados e programas durante toda a semana.",
    imageUrl: "/images/churches/igreja-adventista.jpg",
    activities: [
      {
        id: "a9",
        churchId: "6",
        name: "Programa de Saude",
        description:
          "Palestras e atividades voltadas a promocao da saude fisica e mental, incluindo culinaria saudavel.",
        date: "2026-02-28",
        time: "15:00",
        category: "Saude",
      },
    ],
  },
  {
    id: "7",
    name: "Comunidade Crista da Graca",
    razaoSocial: "Comunidade Crista da Graca",
    address: "Av. Brasil, 2500",
    city: "Sao Paulo",
    neighborhood: "Vila Mariana",
    phone: "(11) 5081-2345",
    email: "contato@ccgraca.com",
    website: "www.ccgraca.com",
    lat: -23.5876,
    lng: -46.6375,
    description:
      "A Comunidade Crista da Graca e uma igreja com foco em relacionamentos autenticos e crescimento espiritual. Nosso lema e: 'Graca que transforma vidas'.",
    imageUrl: "/images/churches/comunidade-crista-graca.jpg",
    activities: [
      {
        id: "a10",
        churchId: "7",
        name: "Noite de Louvor",
        description:
          "Uma noite inteira dedicada ao louvor e adoracao com bandas convidadas e momentos de oracao.",
        date: "2026-03-20",
        time: "19:30",
        category: "Musica",
      },
      {
        id: "a11",
        churchId: "7",
        name: "Curso de Lideranca",
        description:
          "Formacao de lideres com aulas semanais sobre lideranca biblica, comunicacao e gestao de ministerios.",
        date: "2026-03-05",
        time: "19:00",
        category: "Estudo",
      },
    ],
  },
  {
    id: "8",
    name: "Igreja Luterana da Reconciliacao",
    razaoSocial: "Igreja Luterana da Reconciliacao",
    address: "Rua Voluntarios da Patria, 450",
    city: "Sao Paulo",
    neighborhood: "Santana",
    phone: "(11) 2973-6789",
    email: "contato@luteranareconciliacao.org",
    website: "www.luteranareconciliacao.org",
    lat: -23.5031,
    lng: -46.6272,
    description:
      "A Igreja Luterana da Reconciliacao preserva a rica tradicao da Reforma enquanto se conecta com as necessidades contemporaneas da comunidade.",
    imageUrl: "/images/churches/igreja-luterana-reconciliacao.jpg",
    activities: [
      {
        id: "a12",
        churchId: "8",
        name: "Grupo de Terceira Idade",
        description:
          "Encontro semanal para idosos com atividades recreativas, estudos biblicos e confraternizacao.",
        date: "2026-02-19",
        time: "14:00",
        category: "Social",
      },
    ],
  },
]

export function getChurchById(id: string): Church | undefined {
  return churches.find((c) => c.id === id)
}

export function getActivityById(id: string): (Activity & { church: Church }) | undefined {
  for (const church of churches) {
    const activity = church.activities.find((a) => a.id === id)
    if (activity) {
      return { ...activity, church }
    }
  }
  return undefined
}

export function getAllActivities(): (Activity & { churchName: string })[] {
  return churches.flatMap((c) =>
    c.activities.map((a) => ({ ...a, churchName: c.name }))
  )
}

export function searchChurches(
  query: string,
  filters?: { category?: string }
): Church[] {
  let results = churches

  if (query) {
    const q = query.toLowerCase()
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.neighborhood.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    )
  }

  if (filters?.category) {
    results = results.filter((c) =>
      c.activities.some(
        (a) => a.category.toLowerCase() === filters.category!.toLowerCase()
      )
    )
  }

  return results
}
