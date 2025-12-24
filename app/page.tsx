'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, ShieldCheck, Globe, CreditCard, FileText, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCountUp } from '@/hooks/useCountUp';

// Dynamic import to avoid SSR issues with canvas
const DotGrid = dynamic(() => import('@/components/DotGrid'), { ssr: false });

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

const staggerContainer = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// --- SECTIONS ---
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
      {/* DotGrid Background */}
      <DotGrid
        dotSize={8}
        gap={28}
        baseColor="#e5e7eb"
        activeColor="#1c4abdff"
        proximity={100}
        speedTrigger={60}
        shockRadius={80}
        shockStrength={2}
        returnDuration={1.0}
      />
      
      {/* White vignette overlay to fade edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,1) 100%)'
      }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-6"
        >
          <span className="text-brand-gray text-xs font-bold tracking-widest uppercase bg-brand-light px-3 py-1 rounded-full border border-brand-border">
            For Freelancers
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-display font-bold text-brand-black tracking-tightest mb-6 max-w-4xl mx-auto leading-[1.1]"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {['Get', 'paid', 'in', 'minutes,', 'not', 'days'].map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.2em]"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: 'easeOut' }
                }
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="text-xl text-brand-gray max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Stop losing money on fees. Receive international payments instantly
          and withdraw to your Nigerian bank account.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link href="/login" className="w-full sm:w-auto h-14 px-8 text-lg inline-flex items-center justify-center rounded-lg font-medium bg-brand-black text-white hover:bg-gray-900 group">
            Create Free Account
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto h-14 px-8 text-lg inline-flex items-center justify-center rounded-lg font-medium bg-white text-brand-black border border-brand-border hover:border-brand-black">
            See How It Works
          </a>
        </motion.div>

        <motion.p
          className="mt-6 text-sm text-brand-gray font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          No credit card required • Free to start
        </motion.p>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-gray-100 to-transparent rounded-full opacity-50 blur-3xl -z-10 pointer-events-none" />
    </section>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const processed = useCountUp(2, 2, isInView);
  const freelancers = useCountUp(5000, 2, isInView);
  const fees = useCountUp(1, 1, isInView);

  return (
    <section ref={ref} className="py-20 bg-brand-light border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="text-5xl md:text-6xl font-mono font-bold text-brand-black mb-2">
              ${processed}M+
            </div>
            <div className="text-xs font-bold tracking-widest text-brand-gray uppercase">
              Processed
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-5xl md:text-6xl font-mono font-bold text-brand-black mb-2">
              {freelancers.toLocaleString()}+
            </div>
            <div className="text-xs font-bold tracking-widest text-brand-gray uppercase">
              Freelancers
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="text-5xl md:text-6xl font-mono font-bold text-brand-black mb-2">
              &lt;{fees}%
            </div>
            <div className="text-xs font-bold tracking-widest text-brand-gray uppercase">
              Fees
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Create Invoice',
      description: 'Generate a payment link in seconds. No crypto, no complexity. Just a simple link for your client.'
    },
    {
      number: '02',
      title: 'Client Pays',
      description: "Your client pays with card or bank transfer in their local currency. They don't need a Lancepay account."
    },
    {
      number: '03',
      title: 'Get Paid',
      description: 'Money hits your Nigerian bank account in minutes. Withdraw instantly to GTBank, Access, Zenith, and more.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-black mb-4">
            How it works
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="relative p-8 rounded-2xl border border-brand-border bg-white hover:border-brand-black/30 transition-colors duration-300"
            >
              <div className="text-6xl font-mono font-bold text-gray-100 mb-6 absolute top-4 right-6 select-none">
                {step.number}
              </div>
              <div className="relative z-10 pt-4">
                <h3 className="text-xl font-bold text-brand-black mb-3">
                  {step.title}
                </h3>
                <p className="text-brand-gray leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'No more waiting 5-7 days. Get your money immediately.'
    },
    {
      icon: ShieldCheck,
      title: 'Under 1% Fees',
      description: 'Keep more of what you earn. Lowest fees in the market.'
    },
    {
      icon: Globe,
      title: 'No Crypto Needed',
      description: 'Works like normal payments. No wallet complexity.'
    },
    {
      icon: CreditCard,
      title: 'Direct to Your Bank',
      description: 'Compatible with all major Nigerian banks.'
    },
    {
      icon: FileText,
      title: 'Professional Invoices',
      description: 'Look legit to clients with automated invoicing.'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: "Know the exact moment you've been paid."
    }
  ];

  return (
    <section className="py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-black mb-4">
            Built for freelancers
          </h2>
          <p className="text-brand-gray max-w-2xl mx-auto">
            Everything you need to manage your international income.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white p-8 rounded-xl border border-brand-border hover:border-brand-black/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-brand-light rounded-lg flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-black mb-2">
                {feature.title}
              </h3>
              <p className="text-brand-gray text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-black mb-4">
            Stop losing money
          </h2>
        </div>

        <motion.div
          className="bg-white rounded-2xl border border-brand-border overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-3 bg-brand-light border-b border-brand-border p-6">
            <div className="col-span-1"></div>
            <div className="col-span-1 text-center font-bold text-brand-gray">
              Traditional
            </div>
            <div className="col-span-1 text-center font-bold text-brand-black text-lg">
              Lancepay
            </div>
          </div>

          {[
            { label: 'Time to receive', traditional: '5-7 days', lancepay: 'Minutes' },
            { label: 'Fees', traditional: '5-10%', lancepay: '< 1%' },
            { label: 'Withdrawal', traditional: '3-5 days', lancepay: 'Same day' },
            { label: 'Account freezes', traditional: 'Common', lancepay: 'Never' }
          ].map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-3 p-6 border-b border-brand-border last:border-0 items-center hover:bg-brand-light/30 transition-colors"
            >
              <div className="col-span-1 font-medium text-brand-black">
                {row.label}
              </div>
              <div className="col-span-1 text-center text-brand-gray">
                {row.traditional}
              </div>
              <div className="col-span-1 text-center font-bold text-brand-black flex items-center justify-center gap-2">
                {row.lancepay}
                <CheckCircle2 className="w-5 h-5 text-brand-success fill-brand-success/10" />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-brand-light border-t border-brand-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-black mb-6">
            Ready to get paid faster?
          </h2>
          <p className="text-xl text-brand-gray mb-10 max-w-2xl mx-auto">
            Join thousands of freelancers keeping more of their money.
          </p>
          <div className="flex flex-col items-center">
            <Link href="/login" className="min-w-[200px] mb-4 h-14 px-8 text-lg inline-flex items-center justify-center rounded-lg font-medium bg-brand-black text-white hover:bg-gray-900">
              Create Free Account
            </Link>
            <p className="text-sm text-brand-muted">
              Free forever for basic use
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ComparisonSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
