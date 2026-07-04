import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, Headphones, Clock } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

const CONTACT = {
  phone: '+91 6026089502',
  phoneHref: 'tel:+916026089502',
  whatsapp: '916026089502',
  whatsappHref: 'https://wa.me/916026089502',
  email: 'support@finfiler.com',
  emailHref: 'mailto:support@finfiler.com',
};

const contactCards = [
  {
    icon: Phone,
    label: 'Phone',
    value: CONTACT.phone,
    href: CONTACT.phoneHref,
    description: 'Call us for urgent compliance or account help.',
    accent: 'from-blue-500/15 to-indigo-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: CONTACT.whatsapp,
    href: CONTACT.whatsappHref,
    description: 'Chat with our team on WhatsApp.',
    accent: 'from-emerald-500/15 to-green-500/10 text-emerald-600 dark:text-emerald-400',
    external: true,
  },
  {
    icon: Mail,
    label: 'Email',
    value: CONTACT.email,
    href: CONTACT.emailHref,
    description: 'Send documents or detailed queries by email.',
    accent: 'from-violet-500/15 to-purple-500/10 text-violet-600 dark:text-violet-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

export default function Support() {
  return (
    <motion.div
      className="mx-auto max-w-4xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          eyebrow="Help Center"
          title="Support"
          description="Reach our team for help with orders, documents, payments, or compliance services."
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mb-6 flex items-start gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 sm:p-5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary-foreground">Office Hours</p>
          <p className="mt-0.5 text-sm text-secondary-foreground">
            Monday – Saturday, 10:00 AM – 6:00 PM IST
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contactCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.a
              key={card.label}
              href={card.href}
              target={card.external ? '_blank' : undefined}
              rel={card.external ? 'noopener noreferrer' : undefined}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="group flex flex-col rounded-2xl border border-border bg-primary p-5 shadow-sm transition hover:border-indigo-500/30 hover:shadow-md"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent}`}>
                <Icon size={20} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                {card.label}
              </p>
              <p className="mt-1 text-base font-semibold text-primary-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-secondary-foreground">{card.description}</p>
            </motion.a>
          );
        })}
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-6 rounded-2xl border border-border bg-secondary/50 p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-indigo-600 dark:text-indigo-400">
            <Headphones size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-primary-foreground">Before you reach out</h2>
            <p className="mt-1 text-sm leading-relaxed text-secondary-foreground">
              Please keep your registered mobile number or order ID handy so we can assist you faster.
              For document-related queries, mention your business name and the service you need help with.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
