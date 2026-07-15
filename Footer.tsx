export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>&copy; {new Date().getFullYear()} ReliefLink. Built for the House of Edtech Fullstack assignment.</p>
        <p>
          {/* TODO: replace the placeholders below with your details before submitting */}
          <span className="font-medium text-slate-700">Your Name</span> ·{" "}
          <a
            href="https://github.com/your-github-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-600 underline underline-offset-2"
          >
            GitHub
          </a>{" "}
          ·{" "}
          <a
            href="https://linkedin.com/in/your-linkedin-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-600 underline underline-offset-2"
          >
            LinkedIn
          </a>
        </p>
      </div>
    </footer>
  );
}
