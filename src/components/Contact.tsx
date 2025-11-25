import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

const Contact = () => {
  const ref = useRef(null);
  const { toast } = useToast();
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      value: "yeaminhs11@gmail.com",
      link: "mailto:yeaminhs11@gmail.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      value: "01521331128",
      link: "tel:+8801521331128"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location",
      value: "Badda,Dhaka, Bangladesh",
      link: "#"
    }
  ];

  return (
    <section id="contact" ref={ref} className="py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wider uppercase">Get In Touch</span>
          <h2 className="text-4xl md:text-5xl font-bold font-display mt-2">
            Let's Build Something <span className="text-gradient">Amazing</span>
          </h2>
          <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
            Have a project in mind? Let's discuss how we can work together
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-2xl font-bold font-display mb-6">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={index}
                    href={info.link}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.title}</p>
                      <p className="font-medium">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-card p-4 rounded-2xl overflow-hidden"
            >
              <h3 className="text-xl font-bold font-display mb-4 px-4 pt-4">Find Me Here</h3>
              <div className="w-full h-[400px] rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14602.26876330394!2d90.41513!3d23.78054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a1162c73bd%3A0x6c47d314bd1c4c0!2sBadda%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"

                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-8 rounded-2xl"
          >
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              console.log("Form submitted"); // Debug log
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const data = Object.fromEntries(formData.entries());
              console.log("Form data:", data); // Debug log

              const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
              if (!submitBtn) {
                console.error("Submit button not found");
                return;
              }
              const originalText = submitBtn.innerHTML;
              submitBtn.disabled = true;
              submitBtn.innerHTML = 'Sending...';

              try {
                console.log("Sending fetch request..."); // Debug log
                const apiUrl = import.meta.env.VITE_API_URL || 'https://p-fyeamin.vercel.app';
                const response = await fetch(`${apiUrl}/contact`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(data),
                });
                console.log("Fetch response received:", response.status); // Debug log

                const result = await response.json();

                if (response.ok) {
                  toast({
                    title: "Message sent!",
                    description: "Thanks for reaching out. I'll get back to you soon.",
                  });
                  form.reset();
                } else {
                  toast({
                    variant: "destructive",
                    title: "Error sending message",
                    description: result.message || "Please try again later.",
                  });
                }
              } catch (error) {
                console.error('Error:', error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Something went wrong. Please try again.",
                });
              } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
              }
            }}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  placeholder="What's this about?"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Tell me about your project..."
                  rows={6}
                  className="bg-background/50 border-border/50 resize-none"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-primary glow-effect hover:scale-105 transition-transform"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
