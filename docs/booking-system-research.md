# Исследование: система бронирования для Brow & Lip Studio

## Краткий вывод

Для этого проекта я рекомендую не строить первую версию записи напрямую на `Google Calendar`, а использовать `Cal.com` как booking-слой, `Google Calendar` как рабочий календарь администратора/студии, а `email / WhatsApp / Telegram` как каналы уведомлений и коммуникации.

Почему:

- сайт сейчас собран как `static Astro`, без серверного backend;
- вам нужен сценарий `заявка -> просмотр администратором -> подтверждение/изменение -> уведомление клиента`;
- у `Google Calendar booking pages` сильный self-booking сценарий, но слабый approval-first сценарий;
- у `Cal.com` есть режим `Requires Confirmation`, webhooks, API и готовые workflows;
- Telegram и WhatsApp имеют ограничения на исходящие сообщения, поэтому их лучше встраивать осознанно, а не как "просто ещё одна кнопка".

Итоговая рекомендация:

1. `Primary booking source`: форма/виджет записи на сайте через `Cal.com`.
2. `Calendar of record`: `Google Calendar`.
3. `Admin workflow`: администратор подтверждает или меняет заявку в `Cal.com`.
4. `Client confirmations`:
   - email для web-формы;
   - WhatsApp-сообщение для WhatsApp-потока;
   - Telegram-сообщение только если пользователь начал диалог с ботом.
5. `Telegram` и `WhatsApp` на первом этапе лучше использовать как дополнительные entry points, а не как единственный источник структурированной записи.

---

## Важное ограничение текущего проекта

Текущий сайт не имеет server runtime и backend API слоя:

- `package.json` и сборка показывают статический сценарий;
- в проекте нет server adapter для Astro;
- значит, "умная запись" потребует внешний сервис или внешний automation/backend слой.

Из этого следуют 2 рабочих пути:

1. `SaaS-first`: Cal.com / Google Calendar / Twilio / email-сервис.
2. `Custom automation`: web form + n8n / Supabase / внешние webhook-и.

Для первой версии я рекомендую `SaaS-first`, потому что она быстрее, дешевле в поддержке и лучше соответствует текущему стеку.

---

## Что именно вы хотите получить

Я интерпретирую задачу так:

1. Клиент может оставить заявку:
   - через форму на сайте;
   - через Telegram;
   - через WhatsApp.
2. Заявка фиксируется в системе.
3. Администратор видит заявку, подтверждает, переносит или связывается с клиентом.
4. После подтверждения клиент получает уведомление:
   - email, если пришёл через сайт;
   - сообщение в WhatsApp, если пришёл через WhatsApp;
   - сообщение в Telegram, если пришёл через Telegram.
5. Желательно, чтобы расписание было связано с реальной занятостью студии и не допускало дублей.

Это не просто "booking widget", а `approval-first booking workflow`.

---

## Разбор каналов записи

## 1. Веб-форма на сайте

Это самый надёжный и управляемый канал.

Плюсы:

- можно собрать структурированные поля: услуга, дата, время, имя, телефон, email, комментарий;
- легко валидировать данные;
- легко встроить pending/confirmed статус;
- проще всего отправлять email-подтверждения;
- это лучший источник данных для календаря, CRM и аналитики.

Минусы:

- нужен внешний backend / SaaS / automation слой;
- пользователю нужно перейти именно в форму записи, а не просто написать в мессенджер.

Вывод:

- сайт должен стать `основным структурированным способом записи`.

## 2. WhatsApp

Подходит отлично для beauty-салона как канал общения и догрева.

Плюсы:

- привычный канал для записи;
- высокий response rate;
- удобно для переносов, уточнений и подтверждений;
- хорошо работает как "быстрая связь с администратором".

Ограничения:

- для production-автоматизации нужен WhatsApp Business API-провайдер;
- без opt-in можно получить блокировки;
- после 24-часового customer service window нужны шаблонные сообщения для бизнес-инициированных отправок.

Это прямо подтверждается в документации Twilio для WhatsApp:

- customer service window действует 24 часа после последнего входящего сообщения;
- вне окна нужно использовать approved templates;
- inbound и outbound идут через webhook/API.

Вывод:

- WhatsApp стоит использовать обязательно;
- но как автоматизированный канал подтверждений лучше через `Twilio WhatsApp` или похожего провайдера;
- если клиент просто написал в личный номер менеджера, автоматизация становится слабее.

## 3. Telegram

Telegram можно использовать, но он слабее WhatsApp именно как подтверждающий booking-канал.

Плюсы:

- удобен для части аудитории;
- можно сделать Telegram bot с мини-воронкой;
- можно слать уведомления админу в Telegram.

Критичное ограничение:

- бот не может сам начать разговор с пользователем;
- пользователь должен сам открыть чат с ботом или отправить сообщение.

Это прямо указано в Telegram Bot docs.

Следствие:

- если пользователь просто кликнул "написать в Telegram администратору", это ещё не значит, что бот сможет автоматически прислать подтверждение;
- для реального auto-confirmation через Telegram нужен именно `Telegram bot flow`, где пользователь начал диалог с ботом.

Вывод:

- Telegram хорошо подходит как:
  - канал связи с администратором;
  - бот для записи на втором этапе;
  - канал внутренних уведомлений админу.
- Но как первый и главный booking-канал он менее удобен, чем сайт + WhatsApp.

---

## Сравнение вариантов реализации

## Вариант A: Google Calendar appointment scheduling

### Как работает

- вы создаёте booking page в Google Calendar;
- пользователь бронирует слот;
- событие автоматически появляется в календаре;
- Google отправляет confirmation/update emails.

### Плюсы

- очень быстро запустить;
- почти без разработки;
- нативная синхронизация с календарём;
- есть email confirmations/reminders.

### Минусы

- плохо подходит для ручного подтверждения администратором;
- это скорее `instant booking`, а не `request -> review -> confirm`;
- слабая интеграция с Telegram;
- WhatsApp подтверждения придётся достраивать отдельно;
- кастомизация UX на сайте ограничена.

### Вердикт

Подходит для очень простого MVP, но `не лучший вариант` под ваш сценарий.

---

## Вариант B: Cal.com + Google Calendar + email/WhatsApp

### Как работает

- на сайте размещается форма/виджет записи Cal.com;
- availability берётся из подключённого Google Calendar;
- для event type включается `Requires Confirmation`;
- клиент оставляет заявку;
- бронь попадает в pending;
- администратор подтверждает / отклоняет / переносит;
- после этого клиент получает confirmation/update;
- можно использовать workflows, webhooks и API.

### Почему это хорошо подходит вам

1. Есть `Requires Confirmation`.
   - Это почти точное совпадение с вашим процессом.

2. Есть `webhooks`.
   - Можно отправлять уведомления администратору и клиенту.

3. Есть `Google Calendar sync`.
   - Календарь остаётся центральным источником занятости.

4. Есть `workflow layer`.
   - Можно добавлять email, SMS и WhatsApp automation.

5. Есть `API`.
   - Если позже захотите уйти в custom booking, миграция будет легче.

### Плюсы

- лучше всего закрывает approval-first сценарий;
- минимально нагружает ваш код;
- не требует сразу писать свою scheduling-систему;
- хорошо масштабируется.

### Минусы

- это внешний сервис;
- нужно отдельно продумать WhatsApp-провайдера;
- Telegram-поток всё равно придётся проектировать отдельно.

### Вердикт

`Лучший вариант для первой рабочей версии`.

---

## Вариант C: Custom flow на базе формы сайта + n8n + Google Calendar + email + WhatsApp + Telegram

### Как работает

- на сайте делается собственная форма;
- она отправляет запрос во внешний webhook;
- webhook запускает workflow в `n8n`;
- workflow:
  - валидирует слот;
  - создаёт pending-заявку в БД/таблице;
  - создаёт pending/tentative событие или служебную запись;
  - уведомляет администратора;
  - после ручного подтверждения отправляет клиенту письмо/WhatsApp/Telegram.

### Плюсы

- максимум гибкости;
- можно полностью подстроить под ваш бизнес-процесс;
- легче объединить сайт, Telegram, WhatsApp, email, CRM и аналитику.

### Минусы

- дольше разработка;
- больше точек отказа;
- нужен полноценный backend/automation stack;
- выше стоимость поддержки.

### Вердикт

Хорошо как `этап 2`, но не как первый запуск.

---

## Моя рекомендация

## Рекомендуемая архитектура v1

### Основа

- `Frontend`: текущий Astro-сайт.
- `Booking layer`: `Cal.com`.
- `Calendar`: `Google Calendar`.
- `Email`: `Resend` или `Brevo`.
- `WhatsApp`: `Twilio WhatsApp`.
- `Telegram`: сначала manual/deep-link + admin notifications; бот на втором этапе.

### Почему именно так

- максимально быстро запускается;
- хорошо встраивается в статический сайт;
- даёт ручное подтверждение;
- оставляет возможность масштабировать процесс;
- не заставляет сразу писать свою scheduling платформу.

---

## Как должен выглядеть процесс пользователя

## Канал 1: через сайт

1. Пользователь открывает форму записи на сайте.
2. Выбирает:
   - услугу;
   - желаемую дату/время;
   - имя;
   - телефон;
   - email;
   - комментарий.
3. Запрос создаётся как `pending`.
4. Администратор получает уведомление.
5. Администратор:
   - подтверждает;
   - предлагает перенос;
   - связывается с клиентом.
6. Пользователь получает:
   - письмо "заявка получена";
   - потом письмо "запись подтверждена" или "предлагаем другой слот".

## Канал 2: через WhatsApp

Рекомендую 2 режима:

### Режим v1

- кнопка на сайте открывает чат WhatsApp;
- администратор вручную общается;
- финальную запись всё равно вносит в Cal.com / calendar workflow.

### Режим v2

- WhatsApp webhook идёт в automation слой;
- система распознаёт structured booking flow;
- администратор подтверждает;
- клиент получает WhatsApp confirmation.

## Канал 3: через Telegram

Рекомендую тоже 2 режима:

### Режим v1

- кнопка открывает Telegram-чат;
- администратор ведёт диалог вручную;
- финальная запись попадает в Cal.com вручную.

### Режим v2

- отдельный Telegram bot;
- пользователь нажимает `/start`;
- бот собирает услугу, дату, телефон, комментарий;
- заявка создаётся в booking workflow;
- подтверждение идёт в Telegram, потому что пользователь уже начал чат с ботом.

---

## Почему я не рекомендую делать Telegram/WhatsApp первичным источником booking сразу

Потому что тогда вы почти сразу получаете:

- parsing свободного текста;
- отсутствие нормальной валидации слотов;
- сложности с подтверждением и переносами;
- проблемы с тем, кто является source of truth;
- тяжёлую поддержку.

Правильнее:

- `source of truth = booking system`;
- `messengers = communication channels`.

---

## Что хранить в системе

Минимальная запись бронирования:

- `booking_id`
- `status`: `pending | confirmed | reschedule_requested | cancelled`
- `source`: `web | whatsapp | telegram | admin`
- `service`
- `requested_start`
- `requested_end`
- `timezone`
- `client_name`
- `phone`
- `email`
- `telegram_id` (если есть)
- `whatsapp_number` (если есть)
- `notes`
- `admin_comment`
- `calendar_event_id`
- `created_at`
- `updated_at`

---

## Где должен работать admin flow

Есть 3 варианта:

### 1. Внутри Cal.com

Лучший для v1.

- booking pending;
- администратор подтверждает прямо там;
- Google Calendar синхронизирован;
- меньше кастомной разработки.

### 2. Через Telegram internal notifications

Хорошо как дополнение.

- новая заявка приходит админу в Telegram;
- в сообщении ссылка "открыть заявку";
- подтверждение всё равно в booking system.

### 3. Своя mini-admin панель

Лучше для v2/v3, не для старта.

---

## Что с подтверждениями клиенту

## Для сайта

Лучший канал: `email`.

Почему:

- естественный канал после web form;
- удобно отправлять "заявка получена", "подтверждено", "перенесено", "отменено";
- легко хранить шаблоны и статусы.

## Для WhatsApp

Лучший канал: `WhatsApp message`, не SMS.

Важно:

- если нужен именно SMS, это отдельный канал и отдельная стоимость;
- если пользователь пришёл через WhatsApp, логичнее подтверждать в WhatsApp.

## Для Telegram

Лучший канал: `сообщение бота`, но только если пользователь уже начал чат с ботом.

Если он просто написал менеджеру вручную в Telegram:

- подтверждение может идти вручную;
- либо запись потом подтверждается email/WhatsApp.

---

## Практический план внедрения

## Этап 1. Запуск рабочей системы записи

Рекомендую:

- встроить `Cal.com` в сайт;
- подключить `Google Calendar`;
- включить `Requires Confirmation`;
- настроить email confirmations;
- оставить кнопки `WhatsApp` и `Telegram` как manual communication channels;
- настроить внутренние уведомления администратору.

Результат:

- сайт уже принимает structured booking requests;
- администратор подтверждает вручную;
- расписание не конфликтует;
- клиент получает понятный ответ.

## Этап 2. Автоматизация уведомлений

- подключить `Resend` или `Brevo` для писем;
- подключить `Twilio WhatsApp` для WhatsApp confirmations/reminders;
- добавить webhook-и:
  - new pending booking;
  - confirmed booking;
  - rescheduled booking;
  - cancelled booking.

## Этап 3. Telegram bot flow

- создать Telegram bot;
- добавить `/start` flow;
- собирать structured booking request прямо в боте;
- синхронизировать этот поток с тем же booking backend / Cal.com process.

## Этап 4. Своя admin automation

Если нужно больше контроля:

- добавить `n8n`;
- завести БД (`Supabase`, `Postgres`, `Airtable` или хотя бы `Google Sheets`);
- сделать нормальный internal approval flow;
- позже добавить CRM.

---

## Конкретный рекомендуемый стек

## Вариант, который я считаю лучшим

### Основа

- `Cal.com Cloud`
- `Google Calendar`
- `Resend` или `Brevo`
- `Twilio WhatsApp`
- `Telegram bot` позже

### Почему не чистый Google Calendar

- он хорош для auto-booking;
- у вас процесс ближе к ручному подтверждению;
- Cal.com лучше закрывает этот паттерн.

### Почему не custom сразу

- проект сейчас статический;
- custom booking резко увеличит сложность;
- сначала лучше получить работающий бизнес-процесс.

---

## Что я бы рекомендовал сделать именно сейчас

### Решение v1

1. На сайте сделать блок `Записаться`.
2. Основная кнопка:
   - `Записаться онлайн`
   - ведёт на embedded Cal.com booking flow.
3. Дополнительные кнопки:
   - `Написать в WhatsApp`
   - `Написать в Telegram`
4. Все подтверждённые или pending записи живут через Cal.com + Google Calendar.
5. Email остаётся обязательным полем даже если клиент пришёл не через email.

Почему email стоит сделать обязательным:

- это надёжный fallback-канал;
- он нужен для подтверждений и переноса;
- WhatsApp/Telegram не всегда будут доступны автоматизации одинаково стабильно.

---

## Открытые вопросы, которые нужно решить до реализации

1. Нужна ли `полная оплата` или `депозит` при записи?
2. Должен ли администратор подтверждать `каждую` запись или только определённые услуги/слоты?
3. Кто именно подтверждает запись:
   - директор,
   - администратор,
   - любой мастер?
4. Нужно ли клиенту выбирать:
   - мастера,
   - услугу,
   - город/локацию,
   - язык общения?
5. Нужно ли сохранять заявки ещё и в:
   - CRM,
   - Google Sheets,
   - Telegram internal channel?

---

## Мой итоговый выбор

Если делать правильно и без лишнего перегруза, я бы выбрал:

`Сайт -> Cal.com (requires confirmation) -> Google Calendar -> email confirmations -> WhatsApp automation -> Telegram bot later`

Это лучшее сочетание:

- скорости запуска;
- надёжности;
- соответствия вашему approval-first процессу;
- совместимости с текущим статическим Astro-сайтом.

---

## Источники

- Google Calendar Appointment Scheduling:
  - https://workspace.google.com/intl/en_id/resources/appointment-scheduling/
- Google Calendar API create events:
  - https://developers.google.com/workspace/calendar/api/guides/create-events
- Telegram bots overview:
  - https://core.telegram.org/bots
- Telegram Login Widget:
  - https://core.telegram.org/widgets/login
- Telegram Bots FAQ:
  - https://core.telegram.org/bots/faq
- Cal.com Workflows:
  - https://cal.com/workflows
- Cal.com Webhooks:
  - https://cal.com/docs/developing/guides/automation/webhooks
- Cal.com API v2:
  - https://cal.com/docs
- Cal.com Requires Confirmation:
  - https://cal.com/help/event-types/how-to-requires
  - https://cal.com/features/requires-confirmation
  - https://cal.com/docs/api-reference/v2/bookings/confirm-a-booking
- Twilio WhatsApp overview:
  - https://www.twilio.com/docs/whatsapp/api
- Twilio WhatsApp Sandbox:
  - https://www.twilio.com/docs/whatsapp/sandbox
- Twilio Content API / templates:
  - https://www.twilio.com/docs/content/create-and-send-your-first-content-api-template
- Resend Email API:
  - https://resend.com/docs/api-reference/emails
- Brevo transactional email:
  - https://developers.brevo.com/docs/send-a-transactional-email
- n8n webhook and integrations:
  - https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
  - https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/
  - https://docs.n8n.io/integrations/builtin/credentials/telegram/
