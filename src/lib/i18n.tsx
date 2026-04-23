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
  "admin.tab.queue": { ru: "Заявки", en: "Queue" },
  "admin.tab.users": { ru: "Пользователи", en: "Users" },
  "admin.pending": { ru: "На модерации", en: "Pending review" },
  "admin.approved": { ru: "Одобрено", en: "Approved" },
  "admin.rejected": { ru: "Отклонено", en: "Rejected" },
  "admin.approve": { ru: "Одобрить", en: "Approve" },
  "admin.reject": { ru: "Отклонить", en: "Reject" },
  "admin.rejectPrompt": { ru: "Укажите причину отклонения:", en: "Reason for rejection:" },
  "admin.verify.approved": { ru: "Артист одобрен и опубликован", en: "Performer approved and published" },
  "admin.verify.rejected": { ru: "Заявка отклонена", en: "Application rejected" },
  "admin.verify.pending": { ru: "Возвращено на модерацию", en: "Returned to pending" },

  // Verification timeline
  "verify.statusLabel": { ru: "Статус верификации", en: "Verification status" },
  "verify.status.pending": { ru: "На рассмотрении", en: "Under review" },
  "verify.status.approved": { ru: "Верифицирован", en: "Verified" },
  "verify.status.rejected": { ru: "Отклонено", en: "Rejected" },
  "verify.rejectedNoReason": { ru: "Свяжитесь с поддержкой EPBMS для деталей.", en: "Contact EPBMS support for details." },
  "verify.step.pending.title": { ru: "Заявка отправлена", en: "Application submitted" },
  "verify.step.pending.desc": { ru: "Команда EPBMS проверит данные за 24–48 часов.", en: "EPBMS team will review within 24–48 hours." },
  "verify.step.approved.title": { ru: "Верификация одобрена", en: "Verification approved" },
  "verify.step.approved.desc": { ru: "Профиль опубликован в каталоге.", en: "Profile is live in the catalog." },

  // Apply
  "apply.eyebrow": { ru: "Заявка артиста", en: "Performer application" },
  "apply.title": { ru: "Стать исполнителем EPBMS", en: "Become an EPBMS performer" },
  "apply.subtitle": { ru: "Расскажите о себе. После верификации профиль появится в каталоге.", en: "Tell us about yourself. Your profile goes live after verification." },
  "apply.stageName": { ru: "Сценическое имя", en: "Stage name" },
  "apply.category": { ru: "Категория", en: "Category" },
  "apply.city": { ru: "Город", en: "City" },
  "apply.tagline": { ru: "Краткое описание", en: "Tagline" },
  "apply.taglinePh": { ru: "Например: Джазовая дива с мировым репертуаром", en: "e.g. Jazz diva with a worldwide repertoire" },
  "apply.description": { ru: "О себе", en: "About you" },
  "apply.descriptionPh": { ru: "Опыт, ключевые проекты, репертуар…", en: "Experience, signature projects, repertoire…" },
  "apply.priceFrom": { ru: "Минимальная цена", en: "Starting price" },
  "apply.submit": { ru: "Отправить на верификацию", en: "Submit for verification" },
  "apply.submitted": { ru: "Заявка отправлена! Мы свяжемся в течение 24–48 часов.", en: "Application sent! We'll get back within 24–48 hours." },

  // Dashboard extras
  "dash.outgoingBookings": { ru: "Мои бронирования", en: "My bookings" },
  "dash.incomingBookings": { ru: "Входящие", en: "Incoming" },
  "dash.yourProfile": { ru: "Ваш профиль", en: "Your profile" },
  "dash.openBookings": { ru: "Открыть бронирования", en: "Open bookings" },
  "dash.reapply": { ru: "Подать заново", en: "Re-apply" },

  // Booking
  "nav.bookings": { ru: "Бронирования", en: "Bookings" },
  "booking.title": { ru: "Запрос на бронирование", en: "Booking request" },
  "booking.subtitle": { ru: "Отправить запрос артисту", en: "Send a request to" },
  "booking.date": { ru: "Дата события", en: "Event date" },
  "booking.location": { ru: "Локация", en: "Location" },
  "booking.budget": { ru: "Бюджет", en: "Budget" },
  "booking.message": { ru: "Сообщение", en: "Message" },
  "booking.send": { ru: "Отправить запрос", en: "Send request" },
  "booking.sent": { ru: "Запрос отправлен!", en: "Request sent!" },
  "booking.demoOnly": {
    ru: "Это демо-артист — бронирование доступно только для верифицированных исполнителей.",
    en: "This is a showcase artist — booking is available for verified performers only.",
  },
  "booking.signInRequired": { ru: "Войдите, чтобы забронировать", en: "Sign in to book" },

  // My bookings
  "bookings.title": { ru: "Бронирования", en: "Bookings" },
  "bookings.heading": { ru: "Мои бронирования", en: "My bookings" },
  "bookings.tab.client": { ru: "Я заказчик", en: "As client" },
  "bookings.tab.performer": { ru: "Я исполнитель", en: "As performer" },
  "bookings.empty": { ru: "Бронирований пока нет", en: "No bookings yet" },
  "bookings.cancel": { ru: "Отменить", en: "Cancel" },
  "bookings.accept": { ru: "Принять", en: "Accept" },
  "bookings.decline": { ru: "Отклонить", en: "Decline" },
  "bookings.markCompleted": { ru: "Отметить выполненным", en: "Mark completed" },
  "bookings.updated": { ru: "Бронирование обновлено", en: "Booking updated" },
  "bookings.status.pending": { ru: "Ожидает", en: "Pending" },
  "bookings.status.accepted": { ru: "Принято", en: "Accepted" },
  "bookings.status.declined": { ru: "Отклонено", en: "Declined" },
  "bookings.status.completed": { ru: "Выполнено", en: "Completed" },
  "bookings.status.cancelled": { ru: "Отменено", en: "Cancelled" },

  // Footer
  "footer.rights": { ru: "Все права защищены", en: "All rights reserved" },
  "footer.tagline": { ru: "Премиум платформа бронирования артистов", en: "Premium artist booking platform" },

  // Chat
  "chat.title": { ru: "Чат по бронированию", en: "Booking chat" },
  "chat.open": { ru: "Открыть чат", en: "Open chat" },
  "chat.close": { ru: "Свернуть чат", en: "Close chat" },
  "chat.placeholder": { ru: "Напишите сообщение…", en: "Type a message…" },
  "chat.send": { ru: "Отправить", en: "Send" },
  "chat.empty": { ru: "Сообщений пока нет — начните диалог", en: "No messages yet — say hello" },

  // Availability
  "avail.title": { ru: "Календарь доступности", en: "Availability calendar" },
  "avail.subtitle": {
    ru: "Выберите дату — занятые дни недоступны для бронирования.",
    en: "Pick a date — busy days are not bookable.",
  },
  "avail.timeSlots": { ru: "Доступные слоты", en: "Available slots" },
  "avail.pickDate": { ru: "Выберите дату для бронирования", en: "Pick a date to book" },
  "avail.bookSelected": { ru: "Забронировать", en: "Book selected" },
  "avail.legend.free": { ru: "Свободно", en: "Free" },
  "avail.legend.busy": { ru: "Занято", en: "Busy" },

  // Schedule manager
  "schedule.title": { ru: "Расписание", en: "Schedule" },
  "schedule.heading": { ru: "Управление доступностью", en: "Manage availability" },
  "schedule.desc": {
    ru: "Заблокируйте даты, когда вы недоступны. Принятые бронирования помечаются автоматически.",
    en: "Block the dates you're unavailable. Accepted bookings are marked automatically.",
  },
  "schedule.block": { ru: "Заблокировать", en: "Block" },
  "schedule.added": { ru: "Дата заблокирована", en: "Date blocked" },
  "schedule.removed": { ru: "Дата освобождена", en: "Date freed" },
  "schedule.cantRemoveBooked": {
    ru: "Эта дата занята подтверждённым бронированием.",
    en: "This date is held by a confirmed booking.",
  },
  "schedule.empty": { ru: "Все даты свободны", en: "All dates are free" },
  "schedule.booked": { ru: "Бронирование", en: "Booked" },
  "schedule.blocked": { ru: "Заблокировано", en: "Blocked" },

  // Misc
  "common.soon": { ru: "Скоро", en: "Soon" },
  "common.loading": { ru: "Загрузка…", en: "Loading…" },
  "common.cancel": { ru: "Отмена", en: "Cancel" },
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
