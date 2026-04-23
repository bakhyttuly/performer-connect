import perf1 from "@/assets/perf-1.jpg";
import perf2 from "@/assets/perf-2.jpg";
import perf3 from "@/assets/perf-3.jpg";
import perf4 from "@/assets/perf-4.jpg";
import perf5 from "@/assets/perf-5.jpg";
import perf6 from "@/assets/perf-6.jpg";

export type CategoryKey = "singer" | "dj" | "band" | "host" | "magic" | "show";

export interface MockPerformer {
  id: string;
  stage_name: string;
  category: CategoryKey;
  tagline: { ru: string; en: string };
  description: { ru: string; en: string };
  cover: string;
  city: { ru: string; en: string };
  price_from: number;
  rating: number;
  reviews_count: number;
  verified: boolean;
  gallery: string[];
}

export const mockPerformers: MockPerformer[] = [
  {
    id: "aurora-vox",
    stage_name: "Aurora Vox",
    category: "singer",
    tagline: { ru: "Джазовая дива с мировым репертуаром", en: "Jazz diva with a worldwide repertoire" },
    description: {
      ru: "Лауреат международных конкурсов. Выступала на закрытых вечерах в Дубае, Монако и Москве. Идеально для свадеб, гала-вечеров и приватных торжеств.",
      en: "Award-winning vocalist. Performed at private gatherings in Dubai, Monaco and Moscow. Perfect for weddings, galas and private celebrations.",
    },
    cover: perf1,
    city: { ru: "Москва", en: "Moscow" },
    price_from: 2400,
    rating: 4.95,
    reviews_count: 142,
    verified: true,
    gallery: [perf1, perf3, perf5],
  },
  {
    id: "marco-luxe",
    stage_name: "Marco Luxe",
    category: "dj",
    tagline: { ru: "Резидент luxury-клубов Европы", en: "Resident of luxury European clubs" },
    description: {
      ru: "Авторские сеты на стыке deep house и nu-disco. Поднимет любой dance-floor — от закрытой яхты до гала-вечера на 1000 гостей.",
      en: "Signature deep house and nu-disco sets. Will lift any dance floor — from a private yacht to a 1000-guest gala.",
    },
    cover: perf2,
    city: { ru: "Дубай", en: "Dubai" },
    price_from: 3500,
    rating: 4.88,
    reviews_count: 96,
    verified: true,
    gallery: [perf2, perf6, perf4],
  },
  {
    id: "vienna-strings",
    stage_name: "Vienna Strings",
    category: "band",
    tagline: { ru: "Камерный квартет высочайшего класса", en: "World-class chamber quartet" },
    description: {
      ru: "Классика, современные хиты в струнной аранжировке. Идеально для церемоний, ужинов и приёмов.",
      en: "Classics and modern hits in string arrangements. Perfect for ceremonies, dinners and receptions.",
    },
    cover: perf3,
    city: { ru: "Вена", en: "Vienna" },
    price_from: 1800,
    rating: 5.0,
    reviews_count: 211,
    verified: true,
    gallery: [perf3, perf1, perf5],
  },
  {
    id: "the-illusionist",
    stage_name: "The Illusionist",
    category: "magic",
    tagline: { ru: "Иллюзионист мирового уровня", en: "World-class illusionist" },
    description: {
      ru: "Close-up магия и большие сцены. Создаёт wow-эффект для гостей любого уровня.",
      en: "Close-up magic and full-stage shows. Wows guests of any caliber.",
    },
    cover: perf4,
    city: { ru: "Лондон", en: "London" },
    price_from: 2100,
    rating: 4.92,
    reviews_count: 78,
    verified: true,
    gallery: [perf4, perf2, perf6],
  },
  {
    id: "sofia-elegance",
    stage_name: "Sofia Elegance",
    category: "host",
    tagline: { ru: "Ведущая премиальных событий", en: "Premium event host" },
    description: {
      ru: "Элегантный стиль, безупречная подача, RU/EN. Ведёт свадьбы, корпоративы и церемонии награждений.",
      en: "Elegant style, flawless delivery, RU/EN. Hosts weddings, corporate events and award ceremonies.",
    },
    cover: perf5,
    city: { ru: "Санкт-Петербург", en: "Saint Petersburg" },
    price_from: 1500,
    rating: 4.97,
    reviews_count: 184,
    verified: true,
    gallery: [perf5, perf1, perf3],
  },
  {
    id: "celeste-aerial",
    stage_name: "Celeste Aerial",
    category: "show",
    tagline: { ru: "Воздушная акробатика и шоу-программа", en: "Aerial acrobatics & show programme" },
    description: {
      ru: "Цирковое шоу мирового уровня — воздушные полотна, кольцо, реквизит. Для самых ярких событий.",
      en: "World-class circus show — aerial silks, hoop, props. For the brightest events.",
    },
    cover: perf6,
    city: { ru: "Париж", en: "Paris" },
    price_from: 2800,
    rating: 4.9,
    reviews_count: 64,
    verified: true,
    gallery: [perf6, perf4, perf2],
  },
];

export interface MockReview {
  id: string;
  performerId: string;
  author: string;
  rating: number;
  text: { ru: string; en: string };
  date: string;
}

export const mockReviews: MockReview[] = [
  {
    id: "r1",
    performerId: "aurora-vox",
    author: "Анна К.",
    rating: 5,
    text: {
      ru: "Аврора превзошла все ожидания! Голос — мурашки. Гости в восторге.",
      en: "Aurora exceeded every expectation. Goosebumps voice. Guests were thrilled.",
    },
    date: "2024-12-04",
  },
  {
    id: "r2",
    performerId: "aurora-vox",
    author: "Dmitry R.",
    rating: 5,
    text: {
      ru: "Профессионализм на каждом шагу. Однозначно рекомендую.",
      en: "Pure professionalism. Highly recommended.",
    },
    date: "2024-11-12",
  },
  {
    id: "r3",
    performerId: "marco-luxe",
    author: "Elena M.",
    rating: 5,
    text: {
      ru: "Marco держал зал до утра. Идеальная читка вечера.",
      en: "Marco kept the floor packed till sunrise. Read the room perfectly.",
    },
    date: "2024-10-22",
  },
];
