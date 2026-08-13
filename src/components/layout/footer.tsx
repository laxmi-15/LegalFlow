import { Shield, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#F5F2EB] py-16 text-xs text-muted">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <a href="/" className="flex items-center gap-2.5">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-accent">
                <span className="h-2.5 w-2.5 rounded-sm bg-background" />
              </span>
              <span className="text-base font-bold tracking-tight text-foreground">
                Legal<span className="text-accent">Flow</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">
              Professional legal client intake and routing, intelligently organized. Our system helps law firms qualify matters, check conflicts, and route cases to the correct legal teams seamlessly.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Secure, Encrypted Systems — HIPAA & Attorney-Client Privilege Compliant
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-4">Navigation</h4>
            <ul className="space-y-2.5 font-medium">
              <li><a href="/" className="hover:text-foreground transition-colors">Home Portal</a></li>
              <li><a href="/intake" className="hover:text-foreground transition-colors">Start Intake Agent</a></li>
              <li><a href="/admin" className="hover:text-foreground transition-colors">Admin Command Center</a></li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-4">Confidentiality</h4>
            <ul className="space-y-2.5 font-medium">
              <li><a href="#" className="hover:text-foreground transition-colors">Ethics Conflict Matrix</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Attorney Privilege Guidelines</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-between border-t border-border pt-8 text-[11px] text-muted-dark">
          <p>© {new Date().getFullYear()} LegalFlow AI Technologies Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" />
            Designed for secure enterprise legal operations.
          </p>
        </div>
      </div>
    </footer>
  );
}
