import { Sidebar } from '@/components/sidebar';
import { SettingsPill } from '@/components/settings-pill';

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-360 flex-col gap-4 bg-canvas p-3 sm:p-6 md:flex-row md:gap-6">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-6">
        <SettingsPill />
        {children}
        <footer className="mt-auto pt-6 text-center text-xs text-ink-soft">
          Creado por{' '}
          <a
            href="https://x.com/depre_cuba"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline decoration-transparent transition-colors hover:decoration-current"
          >
            Julio César Martín
          </a>
        </footer>
      </main>
    </div>
  );
}
