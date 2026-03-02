import { Link } from "react-router-dom";
import { BriefcaseBusiness, Contact, FileText, ShieldCheck, ScrollText } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {year} IT Community BD. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/jobs" className="inline-flex items-center gap-1 hover:text-slate-900"><BriefcaseBusiness size={14} />Jobs</Link>
          <Link to="/about" className="inline-flex items-center gap-1 hover:text-slate-900"><FileText size={14} />About</Link>
          <Link to="/contact" className="inline-flex items-center gap-1 hover:text-slate-900"><Contact size={14} />Contact</Link>
          <Link to="/privacy-policy" className="inline-flex items-center gap-1 hover:text-slate-900"><ShieldCheck size={14} />Privacy</Link>
          <Link to="/terms-conditions" className="inline-flex items-center gap-1 hover:text-slate-900"><ScrollText size={14} />Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
