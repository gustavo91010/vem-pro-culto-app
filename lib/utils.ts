import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const MOCK_CHURCH_IMAGES = [
  "/images/churches/igreja-batista-central.jpg",
  "/images/churches/comunidade-evangelica-esperanca.jpg",
  "/images/churches/igreja-presbiteriana-renovada.jpg",
  "/images/churches/igreja-metodista-copacabana.jpg",
  "/images/churches/assembleia-de-deus-madureira.jpg",
  "/images/churches/igreja-adventista.jpg",
  "/images/churches/comunidade-crista-graca.jpg",
  "/images/churches/igreja-luterana-reconciliacao.jpg",
];

export function getChurchImageUrl(imageUrl?: string, churchId?: string | number) {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/images/"))) {
    // Se a imagem parecer válida (URL completa ou path local que não seja o default antigo), retorna ela
    if (imageUrl !== "/images/churches/default.svg") {
      return imageUrl;
    }
  }
  
  // Se não tem imagem ou é o default, usa uma das mocadas baseada no ID para ser determinístico
  const id = typeof churchId === 'string' ? parseInt(churchId, 10) : (churchId || 0);
  const index = isNaN(id) ? 0 : id % MOCK_CHURCH_IMAGES.length;
  return MOCK_CHURCH_IMAGES[index];
}

const ACTIVITY_CATEGORY_IMAGES: Record<string, string> = {
  evento: "/images/activities/evento.jpg",
  jovens: "/images/activities/jovens.jpg",
  estudo: "/images/activities/estudo.jpg",
  musica: "/images/activities/musica.jpg",
  social: "/images/activities/social.jpg",
  saude: "/images/activities/saude.jpg",
  criancas: "/images/activities/criancas.jpg",
  // Novos mapeamentos para as categorias do seu Select
  culto: "/images/activities/culto.jpg",
  atividade: "/images/activities/jovens.jpg",
  evangelismo: "/images/activities/evangelismo.jpg",
  acao_social: "/images/activities/social.jpg",
  ebd: "/images/activities/estudo.jpg",
};

export function getActivityImageUrl(category?: string, imageUrl?: string) {
  if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("/images/"))) {
    return imageUrl;
  }

  // Normaliza: minúsculo, sem acentos e troca underscores por nada (ou mantém para bater com o objeto)
  const key = (category || "evento")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
    
  // Tenta encontrar a chave direta (ex: acao_social) ou a chave sem underscore (ex: acaosocial)
  return ACTIVITY_CATEGORY_IMAGES[key] || 
         ACTIVITY_CATEGORY_IMAGES[key.replace(/_/g, "")] || 
         ACTIVITY_CATEGORY_IMAGES.evento;
}
