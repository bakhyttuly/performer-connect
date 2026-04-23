import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

type Dict = Record<string, { ru: string; en: string }>;

const dict: Dict = {
  // Brand
  "brand.tagline": { ru: "Элитные исполнители для ваших событий", en: "Elite performers for your events" },

  // Nav
  "nav.home": { ru: "Главная", en: "Home" },
  "nav.catalog": { ru: "Каталог", en: "Catalog" },
  "nav.howItWorks": { ru: "Как это работает", en: "How it works" },
  "nav.signin": { ru: "Войти", en: "Sign in" },
  "nav.signup": { ru: "Регистрация", en: "Sign up" },
  "nav.signout": { ru: "Выйти", en: "Sign out" },
  "nav.dashboard": { ru: "Кабинет", en: "Dashboard" },

  // Hero
  "hero.eyebrow": { ru: "EPBMS · Премиум платформа", en: "EPBMS · Premium platform" },
  "hero.title.1": { ru: "Бронируйте", en: "Book" },
  "hero.title.gold": { ru: "лучших артистов", en: "elite artists" },
  "hero.title.3": { ru: "для незабываемых событий", en: "for unforgettable events" },
  "hero.subtitle": {
    ru: "Верифицированные музыканты, ведущие, шоумены и артисты — в одном месте. Прозрачные цены, реальные отзывы, безопасная сделка.",
    en: "Verified musicians, hosts, performers and entertainers in one place. Transparent prices, real reviews, secure booking.",
  },
  "hero.cta.browse": { ru: "Найти артиста", en: "Find an artist" },
  "hero.cta.become": { ru: "Стать исполнителем", en: "Become a performer" },
  "hero.search.placeholder": { ru: "Поиск по имени, городу или категории…", en: "Search by name, city or category…" },

  // Stats
  "stats.performers": { ru: "Артистов", en: "Performers" },
  "stats.events": { ru: "Событий", en: "Events" },
  "stats.cities": { ru: "Городов", en: "Cities" },
  "stats.rating": { ru: "Средний рейтинг", en: "Average rating" },

  // Catalog
  "catalog.title": { ru: "Афиша исполнителей", en: "Featured performers" },
  "catalog.subtitle": { ru: "Тщательно отобранные артисты для частных и корпоративных событий", en: "Hand-picked artists for private and corporate events" },
  "catalog.viewAll": { ru: "Смотреть всех", en: "View all" },
  "catalog.empty": { ru: "Пока никого нет — будьте первым!", en: "No performers yet — be the first!" },
  "catalog.book": { ru: "Заказать", en: "Book" },
  "catalog.from": { ru: "от", en: "from" },
  "catalog.verified": { ru: "Верифицирован", en: "Verified" },

  // Categories
  "cat.all": { ru: "Все", en: "All" },
  "cat.singer": { ru: "Вокалисты", en: "Singers" },
  "cat.dj": { ru: "Диджеи", en: "DJs" },
  "cat.band": { ru: "Группы", en: "Bands" },
  "cat.host": { ru: "Ведущие", en: "Hosts" },
  "cat.magic": { ru: "Иллюзионисты", en: "Magicians" },
  "cat.show": { ru: "Шоу-программы", en: "Shows" },

  // How it works
  "how.title": { ru: "Как это работает", en: "How it works" },
  "how.s1.t": { ru: "Выберите", en: "Choose" },
  "how.s1.d": { ru: "Просматривайте профили, видео и отзывы.", en: "Browse profiles, videos, and reviews." },
  "how.s2.t": { ru: "Согласуйте", en: "Discuss" },
  "how.s2.d": { ru: "Обсудите детали в защищённом чате.", en: "Talk through details in a secure chat." },
  "how.s3.t": { ru: "Забронируйте", en: "Book" },
  "how.s3.d": { ru: "Оплатите и получите подтверждение.", en: "Pay and get confirmation." },

  // Profile
  "profile.about": { ru: "О себе", en: "About" },
  "profile.gallery": { ru: "Портфолио", en: "Gallery" },
  "profile.reviews": { ru: "Отзывы", en: "Reviews" },
  "profile.message": { ru: "Написать", en: "Message" },
  "profile.book": { ru: "Заказать", en: "Book" },
  "profile.basedIn": { ru: "Город", en: "Based in" },
  "profile.notFound": { ru: "Артист не найден", en: "Performer not found" },
  "profile.backToCatalog": { ru: "Вернуться в каталог", en: "Back to catalog" },

  // Auth
  "auth.signin.title": { ru: "Вход в EPBMS", en: "Sign in to EPBMS" },
  "auth.signup.title": { ru: "Создать аккаунт", en: "Create your account" },
  "auth.email": { ru: "Email", en: "Email" },
  "auth.password": { ru: "Пароль", en: "Password" },
  "auth.fullName": { ru: "Полное имя", en: "Full name" },
  "auth.submit.signin": { ru: "Войти", en: "Sign in" },
  "auth.submit.signup": { ru: "Создать аккаунт", en: "Create account" },
  "auth.toggle.toSignup": { ru: "Нет аккаунта? Зарегистрироваться", en: "No account? Sign up" },
  "auth.toggle.toSignin": { ru: "Уже есть аккаунт? Войти", en: "Have an account? Sign in" },
  "auth.error.generic": { ru: "Что-то пошло не так. Попробуйте снова.", en: "Something went wrong. Try again." },
  "auth.success.signin": { ru: "Добро пожаловать!", en: "Welcome back!" },
  "auth.success.signup": { ru: "Аккаунт создан. Проверьте почту для подтверждения.", en: "Account created. Check your email to confirm." },

  // Roles
  "role.client": { ru: "Клиент", en: "Client" },
  "role.performer": { ru: "Исполнитель", en: "Performer" },
  "role.admin": { ru: "Администратор", en: "Admin" },
  "nav.admin": { ru: "Админ", en: "Admin" },

  // Dashboard
  "dash.welcome": { ru: "Добро пожаловать в EPBMS", en: "Welcome to EPBMS" },
  "dash.bookings": { ru: "Бронирования", en: "Bookings" },
  "dash.messages": { ru: "Сообщения", en: "Messages" },
  "dash.favorites": { ru: "Избранное", en: "Favorites" },
  "dash.becomeTitle": { ru: "Стать исполнителем", en: "Become a performer" },
  "dash.becomeDesc": {
    ru: "Создайте профиль артиста, добавьте описание и принимайте бронирования от клиентов EPBMS.",
    en: "Create an artist profile, add details and start receiving bookings from EPBMS clients.",
  },
  "dash.becomeCta": { ru: "Активировать профиль", en: "Activate profile" },
  "dash.becamePerformer": { ru: "Роль исполнителя добавлена", en: "Performer role granted" },
  "dash.performerTitle": { ru: "Кабинет исполнителя", en: "Performer workspace" },
  "dash.performerDesc": {
    ru: "Заполните профиль, чтобы клиенты могли вас находить и бронировать.",
    en: "Complete your profile so clients can find and book you.",
  },
  "dash.editProfile": { ru: "Редактировать профиль", en: "Edit profile" },
  "dash.viewCatalog": { ru: "Открыть каталог", en: "Open catalog" },
  "dash.adminTitle": { ru: "Панель администратора", en: "Admin console" },
  "dash.adminDesc": {
    ru: "Управление пользователями, ролями и верификацией артистов.",
    en: "Manage users, roles and performer verification.",
  },

  // Admin
  "admin.title": { ru: "Администрирование", en: "Administration" },
  "admin.subtitle": { ru: "Управление пользователями и правами", en: "Manage users and permissions" },
  "admin.users": { ru: "Пользователи", en: "Users" },
  "admin.totalUsers": { ru: "Всего пользователей", en: "Total users" },
  "admin.totalPerformers": { ru: "Исполнителей", en: "Performers" },
  "admin.totalAdmins": { ru: "Админов", en: "Admins" },
  "admin.grant": { ru: "Назначить", en: "Grant" },
  "admin.revoke": { ru: "Снять", en: "Revoke" },
  "admin.granted": { ru: "Роль назначена", en: "Role granted" },
  "admin.revoked": { ru: "Роль снята", en: "Role revoked" },
  "admin.empty": { ru: "Пользователей пока нет", en: "No users yet" },

  // Footer
  "footer.rights": { ru: "Все права защищены", en: "All rights reserved" },
  "footer.tagline": { ru: "Премиум платформа бронирования артистов", en: "Premium artist booking platform" },

  // Misc
  "common.soon": { ru: "Скоро", en: "Soon" },
  "common.loading": { ru: "Загрузка…", en: "Loading…" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict | string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("epbms.lang") as Lang | null) : null;
    if (saved === "ru" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("epbms.lang", l);
  };

  const t = (key: string) => {
    const entry = dict[key as keyof typeof dict];
    if (!entry) return key;
    return entry[lang];
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
