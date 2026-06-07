import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Star, 
  Clock, 
  ShieldCheck, 
  Check, 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  CheckCircle2,
  Info, 
  Award, 
  Leaf, 
  Sparkle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Flame,
  Quote
} from 'lucide-react';

import { 
  CleaningType, 
  PropertyDetails, 
  ClientContact, 
  RoomType 
} from './types';

import { 
  CLEANING_TYPES, 
  ROOMS_MAP, 
  AIRBNB_TURNOVER_CHECKLIST, 
  calculateEstimate 
} from './data';

import { AnimatedCounter } from './components/AnimatedCounter';
import { FloatingInput, FloatingSelect } from './components/FloatingInput';
import { MobileStickyCTA } from './components/MobileStickyCTA';
import { StickyContactButton, PhoneLink } from './components/StickyContactButton';
import { LivePlanPanel } from './components/LivePlanPanel';
import { useLivePlan, getTaskMeta, getCleaningTypeName } from './hooks/useLivePlan';

// Premium Curated Images
const PREMIUM_IMAGES = {
  // Bright natural lighting, modern luxury home, professional smiling house cleaner in a white kitchen:
  heroBg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80', 
  kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
  living: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=800&q=80'
};

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [cleaningType, setCleaningType] = useState<CleaningType>('standard');
  const [selectedRoomTab, setSelectedRoomTab] = useState<RoomType>('kitchen');
  
  // Custom set of selected task IDs (default standard tasks pre-filled to guide user)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(
    new Set(['k-stovetop', 'ba-fixtures', 'be-vacuum', 'l-mop'])
  );

  // Property Details
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    sqFt: 1800,
    bedroomsCount: 3,
    bathroomsCount: 2,
    hasPets: false,
    lastCleanInterval: '1-3-months'
  });

  // Client Contact Details
  const [contactInfo, setContactInfo] = useState<ClientContact>({
    name: '',
    phone: '',
    email: '',
    address: '',
    preferredDate: '',
    preferredTime: 'morning'
  });

  // Submission Status
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Refs for scrolling to the sections smoothly
  const builderRef = useRef<HTMLDivElement>(null);
  const estimateRef = useRef<HTMLDivElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const [showMobileCTA, setShowMobileCTA] = useState(false);

  // Restore state from LocalStorage for persistence
  useEffect(() => {
    try {
      const savedType = localStorage.getItem('batista_cleaning_type');
      if (savedType) setCleaningType(savedType as CleaningType);

      const savedTasks = localStorage.getItem('batista_selected_tasks');
      if (savedTasks) {
        setSelectedTasks(new Set(JSON.parse(savedTasks)));
      }

      const savedProps = localStorage.getItem('batista_property_details');
      if (savedProps) {
        setPropertyDetails(JSON.parse(savedProps));
      }

      const savedContact = localStorage.getItem('batista_contact_info');
      if (savedContact) {
        setContactInfo(JSON.parse(savedContact));
      }
    } catch (e) {
      console.warn('Failed to recover cached state', e);
    }
  }, []);

  // Save changes to localStorage for state recovery
  useEffect(() => {
    try {
      localStorage.setItem('batista_cleaning_type', cleaningType);
      localStorage.setItem('batista_selected_tasks', JSON.stringify(Array.from(selectedTasks)));
      localStorage.setItem('batista_property_details', JSON.stringify(propertyDetails));
      localStorage.setItem('batista_contact_info', JSON.stringify(contactInfo));
    } catch (e) {
      console.error('Failed to cache progress state', e);
    }
  }, [cleaningType, selectedTasks, propertyDetails, contactInfo]);

  // Live calculation model
  const estimate = useMemo(() => {
    return calculateEstimate(cleaningType, selectedTasks, propertyDetails);
  }, [cleaningType, selectedTasks, propertyDetails]);

  const { isRecalculating, insight, triggerRecalc } = useLivePlan(estimate);

  const sqFtProgress = useMemo(() => {
    return ((propertyDetails.sqFt - 500) / (5000 - 500)) * 100;
  }, [propertyDetails.sqFt]);

  const mobileCtaLabel = useMemo(() => {
    if (isSubmitted) return 'Request Estimate';
    if (step >= 3) return 'Claim $50 Discount';
    return 'Request Estimate';
  }, [step, isSubmitted]);

  useEffect(() => {
    const handleScroll = () => {
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0;
      setShowMobileCTA(heroBottom < 0 && !isSubmitted);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSubmitted]);

  // Project Scope Completion tracker
  const progressPercentage = useMemo(() => {
    if (isSubmitted) return 100;
    if (step === 1) return 25;
    if (step === 2) return 50;
    if (step === 3) return 75;
    return 10;
  }, [step, isSubmitted]);

  // Toggle checklist tasks
  const handleToggleTask = (taskId: string) => {
    const meta = getTaskMeta(taskId);
    const added = !selectedTasks.has(taskId);
    const newTasks = new Set(selectedTasks);
    if (added) {
      newTasks.add(taskId);
    } else {
      newTasks.delete(taskId);
    }
    setSelectedTasks(newTasks);
    if (meta) {
      triggerRecalc({
        type: 'task-toggle',
        taskId,
        added,
        taskName: meta.name,
        minutes: meta.estimatedMinutesPerUnit,
      });
    }
  };

  const handleCleaningTypeChange = (type: CleaningType) => {
    setCleaningType(type);
    triggerRecalc({ type: 'cleaning-type', name: getCleaningTypeName(type) });
  };

  // Reset entire flow
  const handleResetForm = () => {
    setCleaningType('standard');
    setSelectedTasks(new Set(['k-stovetop', 'ba-fixtures', 'be-vacuum', 'l-mop']));
    setPropertyDetails({
      sqFt: 1800,
      bedroomsCount: 3,
      bathroomsCount: 2,
      hasPets: false,
      lastCleanInterval: '1-3-months'
    });
    setContactInfo({
      name: '',
      phone: '',
      email: '',
      address: '',
      preferredDate: '',
      preferredTime: 'morning'
    });
    setStep(1);
    setIsSubmitted(false);
    setErrorMessage('');
    
    setTimeout(() => {
      builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const scrollToBuilder = () => {
    builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!contactInfo.name.trim()) return setErrorMessage('Please provide your name.');
    if (!contactInfo.phone.trim()) return setErrorMessage('Please provide a contact phone number.');
    if (!contactInfo.email.trim()) return setErrorMessage('Please provide a valid email address.');
    if (!contactInfo.address.trim()) return setErrorMessage('Please supply the property street address.');

    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1200);
  };

  const scrollToContact = () => {
    if (step < 3) setStep(3);
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleMobileCTA = () => {
    if (step >= 3 || isSubmitted) {
      scrollToContact();
    } else {
      scrollToBuilder();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#111827] flex flex-col items-center justify-between antialiased selection:bg-[#FF5722]/15 selection:text-[#FF5722] pb-0 md:pb-0">
      
      {/* GLOBAL TRANSLUCENT PREMIUM HEADER */}
      <header className="w-full sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleResetForm}>
            <div className="w-9 h-9 bg-[#FF5722] rounded-xl flex items-center justify-center shadow-md shadow-[#FF5722]/15">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-sm tracking-widest text-[#111827] uppercase leading-tight">
                BATISTA
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest -mt-0.5">
                Luxury Cleaners
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <PhoneLink className="hidden md:inline-flex text-xs font-bold text-gray-600" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Available spots open today</span>
            </div>
            <button 
              onClick={scrollToBuilder}
              className="btn-premium px-4 py-2.5 bg-[#111827] hover:bg-black text-white rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-sm cursor-pointer"
            >
              Get Free Estimate
            </button>
          </div>
        </div>
      </header>

      {/* 1. PREMIUM COHESIVE MARKETING HERO SECTION */}
      <section ref={heroRef} className="w-full relative min-h-[85vh] flex items-center justify-center overflow-hidden py-16 px-4">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${PREMIUM_IMAGES.heroBg})` }}
        />
        <div className="absolute inset-0 hero-gradient-animated z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#FF5722]/5 z-10 pointer-events-none" />
        
        <div className="absolute top-16 right-[10%] w-72 h-72 bg-[#FF5722]/12 rounded-full blur-3xl gradient-orb z-10 pointer-events-none" />
        <div className="absolute bottom-32 left-[8%] w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl gradient-orb z-10 pointer-events-none" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-200/8 rounded-full blur-3xl z-10 pointer-events-none" style={{ animation: 'pulse-soft 6s ease-in-out infinite' }} />

        {/* Floating trust indicators */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          className="absolute top-28 right-8 lg:right-16 z-20 hidden sm:flex items-center gap-2 glass-panel rounded-2xl px-4 py-2.5 shadow-lg float-indicator"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-bold text-gray-700">$2M Insured</span>
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-40 right-12 lg:right-24 z-20 hidden md:flex items-center gap-2 glass-panel rounded-2xl px-4 py-2.5 shadow-lg"
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-bold text-gray-700">4.97 Avg Rating</span>
        </motion.div>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-1/2 left-6 lg:left-12 z-20 hidden lg:flex items-center gap-2 glass-panel rounded-2xl px-4 py-2.5 shadow-lg"
        >
          <Clock className="w-4 h-4 text-[#FF5722]" />
          <span className="text-[11px] font-bold text-gray-700">&lt; 15 Min Response</span>
        </motion.div>

        <div className="max-w-6xl mx-auto w-full relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 text-left space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#FF5722]/15 px-3.5 py-2 rounded-full shadow-sm">
              <Flame className="w-4 h-4 text-[#FF5722]" />
              <span className="text-[11px] font-extrabold text-[#FF5722] tracking-wider uppercase">
                Limited Summer Special — Save $50
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-[0.2em]">
                Premium Residential Cleaning
              </p>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-[3.5rem] text-[#111827] tracking-tight leading-[1.02]">
                Batista<br className="hidden sm:block" /> Cleaning Service
              </h1>
              <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-gray-600 tracking-tight">
                You relax. <span className="bg-gradient-to-r from-[#FF5722] to-amber-600 bg-clip-text text-transparent">We clean.</span>
              </p>
            </div>

            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-lg font-medium">
              Build your custom scope in under 60 seconds. Get a transparent live estimate. Vetted professionals handle the rest.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={scrollToBuilder}
                className="btn-premium px-7 py-4 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-2xl font-display font-black text-xs tracking-widest uppercase shadow-lg shadow-[#FF5722]/25 flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Free Estimate</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => {
                  document.getElementById('services-preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="btn-premium px-7 py-4 bg-white/90 hover:bg-white text-gray-800 rounded-2xl font-display font-black text-xs tracking-widest uppercase border border-gray-200/80 shadow-sm cursor-pointer backdrop-blur-sm"
              >
                View Gallery
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200/60 max-w-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Trusted on every platform
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  { name: 'Google', color: 'text-gray-800', rating: '5.0' },
                  { name: 'Yelp', color: 'text-[#D32323]', rating: '4.9' },
                  { name: 'Facebook', color: 'text-[#1877F2]', rating: '5.0' },
                  { name: 'Thumbtack', color: 'text-amber-600', rating: 'Elite' },
                ].map((badge, i) => (
                  <motion.div
                    key={badge.name}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: i * 0.4 }}
                    className="glass-panel rounded-xl p-2.5 flex flex-col items-center text-center"
                  >
                    <span className={`text-xs font-black ${badge.color}`}>{badge.name}</span>
                    <div className="flex gap-0.5 text-amber-500 my-0.5">
                      {[1, 2, 3, 4, 5].map(j => <Star key={j} className="w-2 h-2 fill-current" />)}
                    </div>
                    <span className="text-[9px] text-[#FF5722] font-black">{badge.rating}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-[#FF5722]/10 to-amber-500/5 rounded-[2rem] blur-2xl" />
            
            <div className="relative estimate-card-hero rounded-3xl p-7 space-y-5 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-black text-gray-800 tracking-wider uppercase">Live Estimate</span>
                </div>
                <span className="px-2.5 py-1 bg-[#111827] text-white font-mono text-[9px] font-black rounded-lg">
                  REAL-TIME
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Estimated Cost</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-black text-[#FF5722]">
                    $<AnimatedCounter value={estimate.discountedMin} /> – $<AnimatedCounter value={estimate.discountedMax} />
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 line-through mt-0.5">
                  ${estimate.priceRangeMin} – ${estimate.priceRangeMax}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Hours</p>
                  <p className="text-sm font-black text-gray-900">
                    <AnimatedCounter value={estimate.hours} decimals={1} />
                  </p>
                </div>
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Crew</p>
                  <p className="text-sm font-black text-gray-900">
                    <AnimatedCounter value={estimate.teamSize} /> Pro{estimate.teamSize > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Score</p>
                  <p className="text-sm font-black text-gray-900">
                    <AnimatedCounter value={estimate.complexityScoreNumeric} />/100
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700">$50 discount auto-applied</span>
              </div>

              <button
                onClick={scrollToBuilder}
                className="btn-premium w-full py-4 bg-[#FF5722] hover:bg-[#E64A19] text-white rounded-2xl font-display font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-md shadow-[#FF5722]/20 cursor-pointer"
              >
                Customize Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. INSTANT SCOPE BUILDER SECTION */}
      <section 
        ref={builderRef} 
        className="w-full max-w-6xl mx-auto py-16 px-4 space-y-8"
      >
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase bg-[#FF5722]/10 px-3 py-1 rounded-md inline-block">
            Build Your Plan
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 tracking-tight">
            1. Instant Scope Builder
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Every selection recalibrates your custom cleaning plan in real time.
          </p>
        </div>

        {/* PROGRESS FEELING TRACKAGE CONTAINER */}
        <div className="glass-panel rounded-3xl p-5 md:p-6 premium-shadow">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5 text-left">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                        isSubmitted || step > s
                          ? 'bg-emerald-500 text-white'
                          : step === s
                            ? 'bg-[#FF5722] text-white step-dot-active'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isSubmitted || step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`w-6 sm:w-10 h-0.5 mx-0.5 transition-colors duration-300 ${step > s || isSubmitted ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <span className="text-gray-900 font-black text-sm block">
                  {isSubmitted ? 'Complete' : step === 1 ? 'Select Plan' : step === 2 ? 'Your Space' : 'Book Info'}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {isSubmitted ? 'Ready for dispatch' : step === 3 ? 'Final step — contact form below' : `Next: ${step === 1 ? 'Property details' : 'Contact info'}`}
                </span>
              </div>
            </div>
            <span className="text-[#FF5722] font-mono font-black text-xs shrink-0 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <AnimatedCounter value={progressPercentage} suffix="%" /> complete
            </span>
          </div>
          
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: 'spring', stiffness: 90, damping: 15 }}
              className="h-full bg-gradient-to-r from-[#FF5722] to-amber-500 rounded-full progress-bar-glow"
            />
          </div>

          {/* Tab quick navigation buttons (Allow jumping between Step 1 and Step 2 easily) */}
          {!isSubmitted && (
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`py-2 px-1 text-center rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  step === 1 
                    ? 'bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border border-transparent'
                }`}
              >
                1. Plan Focus
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`py-2 px-1 text-center rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  step === 2 
                    ? 'bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border border-transparent'
                }`}
              >
                2. My Space
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(3);
                  setTimeout(() => {
                    contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                className={`py-2 px-1 text-center rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  step === 3 
                    ? 'bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-500 border border-transparent'
                }`}
              >
                3. Book Info
              </button>
            </div>
          )}
        </div>

        {/* REPLICABLE STEP VIEWS */}
        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-150 rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-6 max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase block">
                BLUEPRINT REGISTERED REGISTERED
              </span>
              <h2 className="text-2xl font-display font-black text-gray-900 leading-tight">
                Spec Config Complete!
              </h2>
              <p className="text-gray-500 text-xs leading-relaxed max-w-md mx-auto">
                Thank you, <span className="font-bold text-gray-950">{contactInfo.name}</span>! We have successfully registered your custom cleaning specs for <span className="font-bold text-[#111827]">{propertyDetails.sqFt} SQ FT</span>.
              </p>
            </div>

            {/* Generated Quote summary block */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-150 text-left space-y-3 shadow-2xs">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200/60">
                <span className="text-gray-500 font-semibold">Street Destination</span>
                <span className="text-[#111827] font-bold truncate max-w-[200px]">{contactInfo.address}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200/60">
                <span className="text-gray-500 font-semibold">Allocated Time</span>
                <span className="text-[#111827] font-bold">{estimate.hours} Hrs of Professional Service</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200/60">
                <span className="text-gray-500 font-semibold">Original Price Range</span>
                <span className="text-gray-400 line-through font-bold">${estimate.priceRangeMin} - ${estimate.priceRangeMax}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-semibold">First-Clean Promo Code</span>
                <span className="text-emerald-600 font-extrabold animate-pulse">-$50.00 Applied</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-150 flex justify-between items-center shadow-2xs mt-2">
                <span className="text-xs font-black text-gray-900">Projected Range Cost</span>
                <span className="text-[#FF5722] font-display font-black text-lg">
                  ${estimate.discountedMin} - ${estimate.discountedMax}
                </span>
              </div>
            </div>

            {/* Bulleted summary features */}
            <div className="space-y-2 pt-2 text-left text-xs font-semibold text-gray-500 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E6F4EA] flex items-center justify-center text-emerald-600 text-[10.5px] font-bold">✓</span>
                <span>$2M Liability Property Insurance Verified for Site Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E6F4EA] flex items-center justify-center text-emerald-600 text-[10.5px] font-bold">✓</span>
                <span>We reach out to coordinate inside 15-minute dispatch window</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#E6F4EA] flex items-center justify-center text-emerald-600 text-[10.5px] font-bold">✓</span>
                <span>Summer schedule placeholder verified</span>
              </div>
            </div>

            <button
              onClick={handleResetForm}
              className="w-full py-4.5 bg-[#111827] hover:bg-black text-white rounded-2xl font-display font-black text-xs uppercase tracking-widest transition duration-150 cursor-pointer"
            >
              Configure Another Space Estimate
            </button>
          </motion.div>
        ) : (
          <>
            {/* Mobile live plan strip */}
            <div className="lg:hidden">
              <LivePlanPanel
                estimate={estimate}
                cleaningType={cleaningType}
                selectedTasks={selectedTasks}
                propertyDetails={propertyDetails}
                isRecalculating={isRecalculating}
                insight={insight}
                compact
                showPlanItems={false}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
              <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-left"
            >
              {/* STEP 1: PLANS SELECT & CUSTOM ROOM SCOPING */}
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase">Step 1 · Services</span>
                    <h3 className="font-display font-black text-xl text-gray-800 leading-tight">
                      Configure your cleaning plan
                    </h3>
                    <p className="text-gray-400 text-xs font-semibold">
                      Watch your live estimate update as you select services →
                    </p>
                  </div>

                  {/* CUSTOM PACKAGE CONTAINER WITH AGGRESSIVE FOCUS STYLES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CLEANING_TYPES.map((type) => {
                      const isSelected = cleaningType === type.id;
                      return (
                        <motion.button
                          key={type.id}
                          type="button"
                          onClick={() => handleCleaningTypeChange(type.id)}
                          whileTap={{ scale: 0.98 }}
                          layout
                          className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative flex flex-col gap-1 cursor-pointer group ${
                            isSelected 
                              ? 'selection-card-active border-l-4 border-l-[#FF5722]' 
                              : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          {/* absolute badge for recommended setting on chosen package */}
                          {isSelected && (
                            <motion.span
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-3 right-4 bg-[#FF5722] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md shadow-[#FF5722]/20 z-10"
                            >
                              Selected
                            </motion.span>
                          )}

                          <div className="flex justify-between items-center w-full mb-0.5">
                            <div>
                              <span className="font-display font-black text-sm sm:text-base tracking-tight text-gray-900 group-hover:text-[#FF5722] transition-colors block">
                                {type.name}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-[#FF5722] tracking-wider uppercase block -mt-0.5">
                                {type.tagline}
                              </span>
                            </div>
                            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition ${
                              isSelected ? 'bg-[#FF5722] text-white' : 'bg-gray-100 text-transparent'
                            }`}>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 pr-4 leading-relaxed font-semibold">
                            {type.description}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* ROOM-BY-ROOM TASK PICKER (Priority focal points) */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
                    <div className="space-y-1">
                      <h4 className="font-display font-black text-sm text-gray-950">
                        Priority Clean Add-On Specifications
                      </h4>
                      <p className="text-[11px] text-gray-400 font-bold">
                        Check additional custom targets for deeper precision and team hour scheduling allocation.
                      </p>
                    </div>

                    {/* Room Category Selection Row */}
                    <div className="flex border-b border-gray-100 pb-1.5 gap-1 overflow-x-auto">
                      {(Object.keys(ROOMS_MAP) as RoomType[]).map((tabKey) => {
                        const roomData = ROOMS_MAP[tabKey];
                        const isTabActive = selectedRoomTab === tabKey;
                        
                        const tabTasksArray = roomData.tasks.map(t => t.id);
                        const tabSelectionsCount = tabTasksArray.filter(tid => selectedTasks.has(tid)).length;

                        let tabLabel = "Kitchen 🍳";
                        if (tabKey === 'bathrooms') tabLabel = "Bathrooms 🧼";
                        if (tabKey === 'bedrooms') tabLabel = "Bedrooms 🛏️";
                        if (tabKey === 'living') tabLabel = "Living Areas 🏡";

                        return (
                          <button
                            key={tabKey}
                            type="button"
                            onClick={() => setSelectedRoomTab(tabKey)}
                            className={`py-2 px-3 rounded-lg text-[11px] font-black tracking-wide uppercase transition-all relative flex-1 cursor-pointer whitespace-nowrap ${
                              isTabActive 
                                ? 'text-[#FF5722] bg-orange-50' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <span>{tabLabel}</span>
                            {tabSelectionsCount > 0 && (
                              <span className="ml-1 px-1.5 h-4.5 text-[9px] font-black bg-[#FF5722] text-white rounded-md inline-flex items-center justify-center">
                                {tabSelectionsCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Tab Checklist items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {ROOMS_MAP[selectedRoomTab].tasks.map((task) => {
                        const isTaskChecked = selectedTasks.has(task.id);
                        return (
                          <motion.button
                            key={task.id}
                            type="button"
                            layout
                            onClick={() => handleToggleTask(task.id)}
                            whileTap={{ scale: 0.97 }}
                            className={`text-left p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer ${
                              isTaskChecked 
                                ? 'selection-card-active text-gray-900' 
                                : 'bg-gray-50/70 hover:bg-white border-gray-100 text-gray-700 hover:border-gray-200'
                            }`}
                          >
                            <div className="space-y-0.5 flex-grow pr-2 text-left">
                              <span className="text-xs font-black block leading-snug">
                                {task.name}
                              </span>
                              <span className="text-[9.5px] text-gray-400 block font-bold leading-tight">
                                {task.description} • +{task.estimatedMinutesPerUnit} mins
                              </span>
                            </div>

                            <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                              isTaskChecked 
                                ? 'bg-[#FF5722] border-[#FF5722] text-white shadow-xs' 
                                : 'bg-white border-gray-200'
                            }`}>
                              {isTaskChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Airbnb automatic specifications panel if requested */}
                  {cleaningType === 'airbnb' && (
                    <div className="bg-[#111827] text-white rounded-3xl p-5.5 shadow-lg space-y-4 border border-white/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5722]/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2">
                        <Sparkle className="w-4 h-4 text-[#FF5722] animate-spin" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                          EXCLUSIVE AIRBNB TURNOVER CONTRACT SPECIFICATION
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display font-black text-sm">Included Turnover Staging Tasks:</h4>
                        <p className="text-[11px] text-gray-400 leading-normal">
                          These hospital-tier sanitization checks are initialized on your bookings automatically.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AIRBNB_TURNOVER_CHECKLIST.map((cTask) => (
                          <div key={cTask.id} className="flex gap-2 items-start text-xs font-semibold text-gray-200">
                            <span className="text-emerald-400">✓</span>
                            <div className="space-y-0.5">
                              <p className="font-black text-white leading-tight">{cTask.title}</p>
                              <p className="text-[9px] text-gray-400">{cTask.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Move to Step 2 Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      setTimeout(() => {
                        builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="w-full py-4.5 bg-[#FF5722] hover:bg-[#E64A19] text-white font-display font-black text-xs tracking-widest uppercase rounded-2xl transition shadow-md shadow-[#FF5722]/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Property Details</span> 
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: DETAIL PROPERTY GEOMETRY & COMPLEXITY */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase">Step 2 · Your Space</span>
                    <h3 className="font-display font-black text-xl text-gray-800 leading-tight">
                      Calibrate property parameters
                    </h3>
                    <p className="text-gray-400 text-xs font-semibold">
                      Size and layout drive crew size and labor hours in your plan.
                    </p>
                  </div>

                  {/* Sq Ft Slider and details */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center text-left">
                      <div>
                        <span className="text-xs font-black text-gray-800 uppercase tracking-widest">TOTAL SPACE AREA</span>
                        <p className="text-[11px] text-gray-400 font-bold">Includes halls, entries & living sections</p>
                      </div>
                      <span className="font-display font-black text-xl text-[#FF5722]">
                        <AnimatedCounter value={propertyDetails.sqFt} /> SQ FT
                      </span>
                    </div>

                    <input 
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={propertyDetails.sqFt}
                      onChange={(e) => {
                        const sqFt = parseInt(e.target.value);
                        setPropertyDetails({ ...propertyDetails, sqFt });
                        triggerRecalc({ type: 'sqft', value: sqFt });
                      }}
                      style={{ '--range-progress': `${sqFtProgress}%` } as React.CSSProperties}
                      className="w-full cursor-pointer"
                    />

                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>500 sq ft</span>
                      <span>2,700 sq ft</span>
                      <span>5,000 sq ft</span>
                    </div>
                  </div>

                  {/* Bed / Bath Room Increments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-150 rounded-2xl p-4.5 flex flex-col gap-2 shadow-3xs">
                      <span className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest block text-left">
                        Bedrooms Count
                      </span>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const bedroomsCount = Math.max(1, propertyDetails.bedroomsCount - 1);
                            setPropertyDetails({ ...propertyDetails, bedroomsCount });
                            triggerRecalc({ type: 'bedrooms', value: bedroomsCount });
                          }}
                          className="w-11 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 font-black flex items-center justify-center cursor-pointer text-lg transition-all"
                        >
                          -
                        </button>
                        <span className="font-display font-black text-lg text-gray-900">{propertyDetails.bedroomsCount}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const bedroomsCount = Math.min(10, propertyDetails.bedroomsCount + 1);
                            setPropertyDetails({ ...propertyDetails, bedroomsCount });
                            triggerRecalc({ type: 'bedrooms', value: bedroomsCount });
                          }}
                          className="w-11 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 font-black flex items-center justify-center cursor-pointer text-lg transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-150 rounded-2xl p-4.5 flex flex-col gap-2 shadow-3xs">
                      <span className="text-[10.5px] font-black text-gray-400 uppercase tracking-widest block text-left">
                        Bathrooms Count
                      </span>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const bathroomsCount = Math.max(1, propertyDetails.bathroomsCount - 1);
                            setPropertyDetails({ ...propertyDetails, bathroomsCount });
                            triggerRecalc({ type: 'bathrooms', value: bathroomsCount });
                          }}
                          className="w-11 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 font-black flex items-center justify-center cursor-pointer text-lg transition-all"
                        >
                          -
                        </button>
                        <span className="font-display font-black text-lg text-gray-900">{propertyDetails.bathroomsCount}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const bathroomsCount = Math.min(10, propertyDetails.bathroomsCount + 1);
                            setPropertyDetails({ ...propertyDetails, bathroomsCount });
                            triggerRecalc({ type: 'bathrooms', value: bathroomsCount });
                          }}
                          className="w-11 h-11 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-800 font-black flex items-center justify-center cursor-pointer text-lg transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Pets and Last Cleans details */}
                  <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-5">
                    <div className="flex justify-between items-center text-left">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-gray-900 block">Are Active Pets Present?</span>
                        <p className="text-[11px] text-gray-400 font-semibold leading-normal">
                          Requires specialized allergen filtration filters on vacuum loops (+15% workload)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const hasPets = !propertyDetails.hasPets;
                          setPropertyDetails({ ...propertyDetails, hasPets });
                          triggerRecalc({ type: 'pets', enabled: hasPets });
                        }}
                        className={`w-12 h-6.5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                          propertyDetails.hasPets ? 'bg-[#FF5722]' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs transition-transform transform ${
                          propertyDetails.hasPets ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-2 text-left animate-none">
                      <span className="text-xs font-black text-gray-800 tracking-wider uppercase block">
                        Last professional clean interval frequency:
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'less-than-1', text: '< 1 month ago' },
                          { id: '1-3-months', text: '1 - 3 months ago' },
                          { id: '3-6-months', text: '3 - 6 months ago' },
                          { id: '6-plus', text: '6+ mos / Never' }
                        ].map((choice) => {
                          const isChoiceActive = propertyDetails.lastCleanInterval === choice.id;
                          return (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() => {
                                setPropertyDetails({
                                  ...propertyDetails,
                                  lastCleanInterval: choice.id as PropertyDetails['lastCleanInterval']
                                });
                                triggerRecalc({ type: 'last-clean', label: choice.text });
                              }}
                              className={`p-3 rounded-xl text-xs font-black border text-center cursor-pointer transition truncate ${
                                isChoiceActive 
                                  ? 'bg-[#111827] border-[#111827] text-white shadow-xs' 
                                  : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'
                              }`}
                            >
                              {choice.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Warning label for long overdue spaces */}
                  {(propertyDetails.lastCleanInterval === '3-6-months' || propertyDetails.lastCleanInterval === '6-plus') && (
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-xs flex items-start gap-2.5 leading-relaxed text-left animate-pulse">
                      <Info className="w-5 h-5 text-[#FF5722] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-[#953E23]">Deep Restoration Reset Required</p>
                        <p className="text-[11px] font-medium text-amber-900/80 mt-0.5">
                          Extended periods without professional detailing allow grease & mineral scale buildup. Our dispatch coordinators will allocate extra care time to achieve pristine baseline purity.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation steps buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setTimeout(() => {
                          builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className="py-4 px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-display font-black text-xs uppercase tracking-widest rounded-2xl transition cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" /> <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(3);
                        setTimeout(() => {
                          contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 120);
                      }}
                      className="flex-grow py-4.5 bg-[#FF5722] hover:bg-[#E64A19] text-white font-display font-black text-xs tracking-widest uppercase rounded-2xl transition shadow-md shadow-[#FF5722]/15 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed: Confirm Contact Info</span> 
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: BOOK DETAILS NOTIFICATION */}
              {step === 3 && (
                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase">STEP 3 OF 3</span>
                    <h3 className="font-display font-black text-lg text-gray-900">Configure Secure Book Coordinate Fields</h3>
                    <p className="text-xs text-gray-400 font-semibold leading-normal">
                      Excellent! Proceed directly to fill out the <span className="text-gray-800 font-bold">Contact Form</span> situated right below the Live Estimate module. Submitting the form completes your custom scope blueprint registration.
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-display font-black text-xs uppercase tracking-widest rounded-2xl text-center border border-gray-150 cursor-pointer"
                    >
                      Adjust Property Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        contactFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="w-full py-3.5 bg-[#111827] hover:bg-black text-white font-display font-black text-xs uppercase tracking-widest rounded-2xl text-center cursor-pointer"
                    >
                      Slide To Contact Form ↓
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
              </div>

              {/* Desktop sticky live plan panel */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="sticky top-24">
                  <LivePlanPanel
                    estimate={estimate}
                    cleaningType={cleaningType}
                    selectedTasks={selectedTasks}
                    propertyDetails={propertyDetails}
                    isRecalculating={isRecalculating}
                    insight={insight}
                    onLockEstimate={scrollToContact}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 3. DYNAMIC LIVE ESTIMATE SECTION */}
      <section 
        ref={estimateRef}
        className="w-full bg-gradient-to-b from-white via-gray-50/50 to-white border-y border-gray-100 py-16 px-4"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase">
              Live Estimate Engine
            </span>
            <h2 className="font-display font-black text-3xl text-gray-900 tracking-tight">
              2. Live Estimate Dashboard
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              Your plan updates instantly as you configure scope above.
            </p>
          </motion.div>

          <motion.div
            animate={isRecalculating ? { scale: [1, 0.995, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <LivePlanPanel
              estimate={estimate}
              cleaningType={cleaningType}
              selectedTasks={selectedTasks}
              propertyDetails={propertyDetails}
              isRecalculating={isRecalculating}
              insight={insight}
              onLockEstimate={scrollToContact}
            />
          </motion.div>

          <p className="text-[10px] text-gray-400 font-medium leading-normal text-center max-w-lg mx-auto">
            Estimates are guidelines. Final rates confirmed during on-site walkthrough.
          </p>
        </div>
      </section>

      {/* 4. TRUST BADGES ROW & CORE PILLARS SECTION */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase bg-[#FF5722]/10 px-3 py-1 rounded-md inline-block">
            VERIFIED BRAND PILLARS
          </span>
          <h2 className="font-display font-black text-3xl text-gray-900 tracking-tight">
            Batista Elite Care Commitments
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            We operate with stringent medical-grade quality standards, safeguarding your family under complete licensed coverage.
          </p>
        </div>

        {/* Dynamic Trust Performance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="bento-card p-6 text-left space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Homes Cleaned</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="text-2xl md:text-3xl font-display font-black text-gray-900">
              <AnimatedCounter value={1420} suffix="+" />
            </div>
            <p className="text-[11px] text-gray-500 font-medium">This month metro-wide</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="bento-card p-6 text-left space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Average Rating</span>
              <div className="flex text-amber-500">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-display font-black text-gray-900">
              <AnimatedCounter value={4.97} decimals={2} /> <span className="text-lg text-gray-400">/ 5</span>
            </div>
            <p className="text-[11px] text-[#FF5722] font-semibold">98% five-star reviews</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="bento-card p-6 text-left space-y-2"
          >
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Response Time</span>
            <div className="text-2xl md:text-3xl font-display font-black text-gray-900">&lt; 15 Min</div>
            <p className="text-[11px] text-gray-500 font-medium">Guaranteed callback</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.24 }}
            className="bento-card p-6 text-left space-y-2"
          >
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Customer Satisfaction</span>
            <div className="text-2xl md:text-3xl font-display font-black text-gray-900">
              <AnimatedCounter value={99.4} decimals={1} suffix="%" />
            </div>
            <p className="text-[11px] text-emerald-600 font-bold">Zero-hassle reclean policy</p>
          </motion.div>
        </div>

        {/* Four Batista Trust Warranties columns */}
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FF5722] text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-5 h-5 text-[#FF5722]" /> Vetted Staff Only
            </div>
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
              We background check and stringently vet our certified cleaning professionals before field deployment.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FF5722] text-xs font-black uppercase tracking-wider">
              <Award className="w-5 h-5 text-[#FF5722]" /> $2M Insured Cap
            </div>
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
              Your high-value luxury possessions are fully secured by our active $2,000,000 comprehensive liability insurance scope.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FF5722] text-xs font-black uppercase tracking-wider">
              <Leaf className="w-5 h-5 text-[#FF5722]" /> Child & Pet Allergen Safe
            </div>
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
              We exclusively use allergen-safe treatments that protect toddlers, pets, and organic floor coat finishes.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#FF5722] text-xs font-black uppercase tracking-wider">
              <Check className="w-5 h-5 text-[#FF5722]" /> 100% Satisfaction SLA
            </div>
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
              Unsatisfied with the corner detail? Request callback within 24 hours for a zero-hassle immediate supervisor spot reclean treatment.
            </p>
          </div>
        </div>
      </section>

      {/* 5. SERVICE GALLERY PHOTO SHOWCASE */}
      <section id="services-preview" className="w-full bg-white border-y border-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase block">
              OUR DECORATIVE SIGNATURE FINISH
            </span>
            <h2 className="font-display font-black text-3xl text-gray-900">
              Behold the Batista Pristine Finish
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
              We process surface elements using modern microfiber techniques. Browse standard finishes our specialists detail beneath meticulous parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Kitchen */}
            <div className="gallery-card group rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/60 relative h-64 text-left shadow-sm">
              <img 
                src={PREMIUM_IMAGES.kitchen} 
                alt="Immaculate Kitchen" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none group-hover:ring-white/20 transition-all" />
              <div className="absolute bottom-4 left-4 text-white z-10 space-y-1">
                <span className="text-[9px] font-mono font-black text-[#FF5722] tracking-wider uppercase block">Degreasing</span>
                <h3 className="font-display font-black text-sm text-white">Luxury Kitchens</h3>
                <p className="text-[10px] text-gray-300 leading-snug opacity-90 group-hover:opacity-100 transition-opacity">Wiped panels, degreased burners & polished grates.</p>
              </div>
            </div>

            {/* Bathroom */}
            <div className="gallery-card group rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/60 relative h-64 text-left shadow-sm">
              <img 
                src={PREMIUM_IMAGES.bathroom} 
                alt="Sparkling Bathroom" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none group-hover:ring-white/20 transition-all" />
              <div className="absolute bottom-4 left-4 text-white z-10 space-y-1">
                <span className="text-[9px] font-mono font-black text-emerald-400 tracking-wider uppercase block">Sanity Reset</span>
                <h3 className="font-display font-black text-sm text-white">Sparkling Vanities</h3>
                <p className="text-[10px] text-gray-300 leading-snug opacity-90 group-hover:opacity-100 transition-opacity">Polished handles, lime resets & sanitized tubs.</p>
              </div>
            </div>

            {/* Bedroom */}
            <div className="gallery-card group rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/60 relative h-64 text-left shadow-sm">
              <img 
                src={PREMIUM_IMAGES.bedroom} 
                alt="Organized Bedroom" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none group-hover:ring-white/20 transition-all" />
              <div className="absolute bottom-4 left-4 text-white z-10 space-y-1">
                <span className="text-[9px] font-mono font-black text-blue-400 tracking-wider uppercase block">Staging</span>
                <h3 className="font-display font-black text-sm text-white">Stretched Linen Bedrooms</h3>
                <p className="text-[10px] text-gray-300 leading-snug opacity-90 group-hover:opacity-100 transition-opacity">Hospital corners, neat sills & deep vacuum.</p>
              </div>
            </div>

            {/* Living Room Area */}
            <div className="gallery-card group rounded-2xl overflow-hidden bg-gray-50 border border-gray-200/60 relative h-64 text-left shadow-sm">
              <img 
                src={PREMIUM_IMAGES.living} 
                alt="Happy Homeowner Space" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none group-hover:ring-white/20 transition-all" />
              <div className="absolute bottom-4 left-4 text-white z-10 space-y-1">
                <span className="text-[9px] font-mono font-black text-purple-400 tracking-wider uppercase block">Dust Detox</span>
                <h3 className="font-display font-black text-sm text-white">Immaculate Living Spaces</h3>
                <p className="text-[10px] text-gray-300 leading-snug opacity-90 group-hover:opacity-100 transition-opacity">Baseboards, steam-mopped floors & pristine tracks.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS REVIEWS CARDS SECTION */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase bg-[#FF5722]/10 px-3 py-1 rounded-md inline-block">
            AUTHENTIC REVIEWS
          </span>
          <h2 className="font-display font-black text-3xl text-gray-900 tracking-tight">
            Client Success Testimonials
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
            Read what luxury residential clients and short-term hospitality hosts write about our dedicated specialist care squads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          
          {[
            {
              quote: "Batista transformed my rental turnover completely. Their hotel bedding styling and restocking checks are flawless. Five-star guest ratings since we joined.",
              initials: 'CV',
              name: 'Clarissa Vance',
              role: 'Luxury Superhost, Miami Beach',
              avatarBg: 'bg-gradient-to-br from-orange-100 to-orange-200',
              ring: 'ring-orange-200/60',
            },
            {
              quote: "Metropolitan detail at its peak. Micro-fine environmental precision essential for my dander allergies. Outstanding background-checked specialists.",
              initials: 'JR',
              name: 'Dr. Julian Ramirez',
              role: 'Penthouse Resident, Brickell',
              avatarBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
              ring: 'ring-blue-200/60',
            },
            {
              quote: "Two golden retrievers and busy schedules — our hardwood looked constantly dusty. Batista's custom checklist directs labor to key zones perfectly.",
              initials: 'SF',
              name: 'The Sterling Family',
              role: 'Suburban Homeowners',
              avatarBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
              ring: 'ring-purple-200/60',
            },
          ].map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="testimonial-card bg-white border border-gray-200/60 rounded-2xl p-6 flex flex-col justify-between space-y-5 premium-shadow"
            >
              <div className="space-y-4">
                <Quote className="w-8 h-8 text-[#FF5722]/15" />
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(j => (
                    <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className={`w-11 h-11 rounded-full ${t.avatarBg} ring-2 ${t.ring} flex items-center justify-center font-display font-black text-xs text-[#FF5722] shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <span className="text-sm font-black text-gray-900 block">{t.name}</span>
                  <span className="text-[10px] text-gray-400 font-semibold block">{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section 
        ref={contactFormRef}
        className="w-full bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 py-16 px-4 pb-28 md:pb-16"
      >
        <div className="max-w-xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-2"
          >
            <span className="text-[10px] font-mono font-black tracking-widest text-[#FF5722] uppercase bg-[#FF5722]/10 px-3 py-1 rounded-md inline-block">
              Final Step
            </span>
            <h2 className="font-display font-black text-3xl text-gray-900 tracking-tight">
              3. Secure Your Free Estimate
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              Lock in your scope and claim your $50 summer discount.
            </p>
            <p className="text-sm text-gray-600 font-semibold">
              Prefer to talk? <PhoneLink className="text-[#FF5722] font-black" />
            </p>
          </motion.div>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="estimate-card-hero rounded-3xl p-8 text-center space-y-5"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-100">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-gray-900">Request Received</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Thanks, <span className="font-bold text-gray-800">{contactInfo.name}</span>. We'll reach out within 15 minutes.
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Need help sooner? <PhoneLink className="text-[#FF5722]" />
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Your estimate</span>
                  <span className="font-black text-[#FF5722]">${estimate.discountedMin} – ${estimate.discountedMax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-bold text-emerald-600">-$50 applied</span>
                </div>
              </div>
              <button onClick={handleResetForm} className="btn-premium w-full py-4 bg-[#111827] text-white rounded-2xl font-display font-black text-xs uppercase tracking-widest cursor-pointer">
                Start New Estimate
              </button>
            </motion.div>
          ) : (
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-semibold flex items-center gap-2.5 text-left"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <div className="estimate-card-hero rounded-3xl p-6 md:p-7 space-y-4">
              <FloatingInput
                id="name"
                label="Full Name"
                value={contactInfo.name}
                onChange={(v) => setContactInfo({ ...contactInfo, name: v })}
                icon={User}
                placeholder="Sandra Lee"
                required
              />
              <FloatingInput
                id="phone"
                label="Phone Number"
                type="tel"
                value={contactInfo.phone}
                onChange={(v) => setContactInfo({ ...contactInfo, phone: v })}
                icon={Phone}
                placeholder="(305) 555-0199"
                required
              />
              <FloatingInput
                id="email"
                label="Email Address"
                type="email"
                value={contactInfo.email}
                onChange={(v) => setContactInfo({ ...contactInfo, email: v })}
                icon={Mail}
                placeholder="sandra@example.com"
                required
              />
              <FloatingInput
                id="address"
                label="Property Address"
                value={contactInfo.address}
                onChange={(v) => setContactInfo({ ...contactInfo, address: v })}
                icon={MapPin}
                placeholder="1590 Biscayne Blvd, Apt 4C"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FloatingSelect
                  id="preferredTime"
                  label="Preferred Time"
                  value={contactInfo.preferredTime}
                  onChange={(v) => setContactInfo({ ...contactInfo, preferredTime: v })}
                >
                  <option value="morning">Morning (8–11 AM)</option>
                  <option value="afternoon">Afternoon (11–3 PM)</option>
                  <option value="late">Late (3–6 PM)</option>
                </FloatingSelect>
                
                <FloatingInput
                  id="preferredDate"
                  label="Target Date"
                  type="date"
                  value={contactInfo.preferredDate}
                  onChange={(v) => setContactInfo({ ...contactInfo, preferredDate: v })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-premium w-full py-5 bg-[#FF5722] hover:bg-[#E64A19] text-white font-display font-black text-xs tracking-widest uppercase rounded-2xl transition shadow-lg shadow-[#FF5722]/25 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Your Quote...</span>
                </>
              ) : (
                <>
                  <span>Claim $50 Discount & Book Walkthrough</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(2);
                builderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full py-3.5 text-gray-500 hover:text-gray-700 font-semibold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              ← Back to scope builder
            </button>
          </form>
          )}
        </div>
      </section>

      <MobileStickyCTA
        visible={showMobileCTA}
        label={mobileCtaLabel}
        sublabel={step >= 2 ? `$${estimate.discountedMin} – $${estimate.discountedMax} estimate` : 'Build scope in 60 seconds'}
        onClick={handleMobileCTA}
      />

      <StickyContactButton elevated={showMobileCTA} />

      {/* LUXURY FOOTER */}
      <footer className="w-full bg-[#111827] text-gray-400 py-12 px-4 text-center border-t border-gray-800 relative z-10 text-xs">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-[#FF5722] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-white tracking-widest text-sm block">
                BATISTA
              </span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block -mt-1">Luxury Cleaners</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold uppercase tracking-wider border-y border-gray-800 py-4 max-w-lg mx-auto">
            <span className="text-gray-300">Miami, FL</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">New York, NY</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">Los Angeles, CA</span>
          </div>

          <PhoneLink className="text-sm font-bold text-gray-300 hover:text-[#FF5722] normal-case tracking-normal justify-center" />

          <p className="text-[10.5px] text-gray-500 leading-relaxed max-w-md mx-auto">
            &copy; 2026 Batista Cleaning Service. All rights reserved. Estimations are computerized forecasts derived based on static layout parameters. All dynamic rates are subject to real inspections of site conditions by our field managers before final billing.
          </p>
        </div>
      </footer>

    </div>
  );
}
