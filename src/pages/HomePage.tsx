import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Printer, Settings2 } from 'lucide-react';
import { THEME_LIST } from '../themes';

export function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-[#FAF8F6] text-[#231B1E] paper-grain">
      <header className="border-b border-[#E7DFDC] bg-[#FAF8F6]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="font-editorial text-2xl font-semibold tracking-tight text-[#231B1E] whitespace-nowrap shrink-0"
          >
            SweetNotes
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-[#6B5B61]">
            <Link
              to="/c/1"
              className="whitespace-nowrap shrink-0 hover:text-[#231B1E] transition-colors"
            >
              Пример послания
            </Link>
            <Link
              to="/admin"
              className="whitespace-nowrap shrink-0 hover:text-[#231B1E] transition-colors"
            >
              Редактор конвертов
            </Link>
            <Link
              to="/print"
              className="whitespace-nowrap shrink-0 hover:text-[#231B1E] transition-colors"
            >
              Печать QR
            </Link>
          </nav>

          <Link
            to="/admin"
            className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#8E2E4E] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#762440] whitespace-nowrap shrink-0"
          >
            Панель управления
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* Hero Narrative */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-medium tracking-wide text-[#8E2E4E]">
              Динамические QR-послания для конфетных конвертиков
            </p>
            <h1 className="mt-3 font-editorial text-4xl font-semibold leading-[1.08] tracking-tight text-[#231B1E] text-balance sm:text-6xl">
              Маленькие сладости с живыми письмами внутри
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#5E4E54] sm:text-lg">
              Распечатайте лист с пронумерованными QR-стикерами, вложите конфетку
              в бумажный конвертик и в любой момент обновляйте текст, тему и
              фотографию для каждого номера.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/c/1"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#8E2E4E] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_26px_-10px_rgba(142,46,78,0.5)] transition-colors hover:bg-[#762440]"
              >
                <Mail className="h-4 w-4" />
                <span>Открыть сюрприз №01</span>
              </Link>

              <Link
                to="/print"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-[#DFD2D6] bg-white px-5 py-3 text-sm font-medium text-[#231B1E] transition-colors hover:bg-[#F5F0F2]"
              >
                <Printer className="h-4 w-4 text-[#8E2E4E]" />
                <span>Лист QR для печати</span>
              </Link>
            </div>
          </div>

          {/* 3-Step Workflow Overview */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#E7DFDC] bg-white p-6 shadow-sm sm:p-8 lg:col-span-5">
            <div className="space-y-6">
              <div>
                <div className="font-mono text-xs text-[#8E2E4E] tabular-nums">
                  01. Печать наклеек
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#5E4E54]">
                  Сгенерируйте от 1 до 30 QR-кодов в едином стиле и вырежьте по
                  аккуратным пунктирным рамкам с подписью номера.
                </p>
              </div>

              <div className="border-t border-[#F1EAE7] pt-5">
                <div className="font-mono text-xs text-[#8E2E4E] tabular-nums">
                  02. Наполнение в редакторе
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#5E4E54]">
                  Войдите по PIN-коду <span className="font-mono">1234</span>,
                  выберите один из 4 бумажных шаблонов, прикрепите фото и
                  зарядите конверт.
                </p>
              </div>

              <div className="border-t border-[#F1EAE7] pt-5">
                <div className="font-mono text-xs text-[#8E2E4E] tabular-nums">
                  03. Копилка воспоминаний
                </div>
                <p className="mt-1 text-sm leading-relaxed text-[#5E4E54]">
                  После прочтения послание одним нажатием отправляется в общий
                  архив, чтобы к нему всегда можно было вернуться.
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-[#F1EAE7] pt-5">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#8E2E4E] hover:underline"
              >
                <Settings2 className="h-4 w-4" />
                <span>Перейти в панель управления</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Themes Showcase */}
        <section className="mt-14 border-t border-[#E7DFDC] pt-10">
          <h2 className="font-editorial text-2xl font-semibold text-[#231B1E] sm:text-3xl">
            Четыре бумажных настроения
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {THEME_LIST.map((theme, idx) => (
              <Link
                key={theme.id}
                to={`/c/${idx + 1}`}
                className={`group rounded-2xl border p-5 transition-transform duration-150 hover:-translate-y-0.5 ${theme.cardBg} ${theme.cardBorder}`}
              >
                <div className={`font-mono text-xs tabular-nums ${theme.textMuted}`}>
                  Пример №0{idx + 1}
                </div>
                <div
                  className={`mt-2 font-editorial text-xl font-semibold ${theme.textPrimary}`}
                >
                  {theme.label}
                </div>
                <p className={`mt-1.5 text-xs leading-relaxed ${theme.textMuted}`}>
                  {theme.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
