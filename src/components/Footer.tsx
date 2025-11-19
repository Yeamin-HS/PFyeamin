import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="container mx-auto px-6">
        <div className="text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Yeamin HS
          </p>
          <p className="mt-2 text-sm">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
