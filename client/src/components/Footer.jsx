export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-white mt-auto relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute -top-32 right-0 w-[300px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 left-0 w-[300px] h-[300px] bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:px-10 py-10 sm:py-12 lg:py-14">
        
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">

          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M7 4L12 1L17 4V10L12 13L7 10V4Z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M7 14L12 11L17 14V20L12 23L7 20V14Z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M3 9L7 7V11L3 13V9Z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M17 7L21 9V13L17 11V7Z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <h3 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SkillHive
              </h3>
            </div>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Connecting skilled professionals with real opportunities. <br />
              Your career journey starts here — confidently.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {[
                { label: "Browse Jobs", href: "/jobs" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Reach Us</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-400">
              <li>📩 support@recruitment.com</li>
              <li>📞 +1 (555) 123-4567</li>
              <li>📍 123 Business Ave, Suite 100</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 mt-8 sm:mt-12 pt-4 sm:pt-6 text-center">
          <p className="text-neutral-500 text-xs sm:text-sm tracking-wide">
            © {currentYear} SkillHive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
