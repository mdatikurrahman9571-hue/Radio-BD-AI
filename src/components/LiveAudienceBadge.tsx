import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Radio, TrendingUp, Sparkles, ChevronDown, ChevronUp,
  Heart, Zap, Globe, MapPin, Volume2
} from 'lucide-react';

interface LiveAudienceBadgeProps {
  stationName?: string;
  stationId?: string;
  uiLang?: 'bn' | 'en';
}

function toBengaliDigits(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

function formatListenerCount(count: number, isBn: boolean): string {
  const formattedEn = count.toLocaleString('en-US');
  return isBn ? toBengaliDigits(formattedEn) : formattedEn;
}

export function LiveAudienceBadge({
  stationName = 'ঢাকা ৯৮.৪ FM',
  stationId = 'dhaka',
  uiLang = 'bn'
}: LiveAudienceBadgeProps) {
  // Station-based base listeners
  const getBaseListeners = (id: string) => {
    switch (id) {
      case 'ctg': return 16420;
      case 'sylhet': return 13850;
      case 'rajshahi': return 12190;
      case 'dhaka':
      default: return 21840;
    }
  };

  const [listenerCount, setListenerCount] = useState(() => getBaseListeners(stationId));
  const [peakCount, setPeakCount] = useState(() => getBaseListeners(stationId) + 3820);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [deltaKey, setDeltaKey] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  const [cheerCount, setCheerCount] = useState(142);

  // When station changes, recalibrate listener baseline smoothly
  useEffect(() => {
    const base = getBaseListeners(stationId);
    const randomized = base + Math.floor(Math.random() * 800) - 400;
    setListenerCount(randomized);
    setPeakCount(randomized + 3500 + Math.floor(Math.random() * 1200));
  }, [stationId]);

  // Simulate continuous organic fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      // 65% chance of positive gain, 35% chance of minor drop
      const isPositive = Math.random() < 0.65;
      const magnitude = Math.floor(Math.random() * 24) + 3; // 3 to 26 change
      const delta = isPositive ? magnitude : -magnitude;

      setListenerCount((prev) => {
        const next = Math.max(8500, prev + delta);
        if (next > peakCount) {
          setPeakCount(next + 120);
        }
        return next;
      });

      setLastDelta(delta);
      setDeltaKey((k) => k + 1);

      // Auto clear delta badge after 2.4 seconds
      setTimeout(() => {
        setLastDelta(null);
      }, 2400);
    }, 3800);

    return () => clearInterval(interval);
  }, [peakCount]);

  // Handle user interaction cheer / applause
  const handleCheer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const boost = Math.floor(Math.random() * 5) + 3;
    setListenerCount((c) => c + boost);
    setCheerCount((c) => c + 1);
    setLastDelta(boost);
    setDeltaKey((k) => k + 1);

    const emojis = ['🔥', '❤️', '👏', '📻', '🎉'];
    const chosenEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const newHeart = {
      id: Date.now() + Math.random(),
      emoji: chosenEmoji,
      x: (Math.random() - 0.5) * 60,
    };

    setFloatingHearts((prev) => [...prev.slice(-10), newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1800);
  };

  const isBn = uiLang === 'bn';

  return (
    <div className="relative select-none z-40">
      {/* Floating Hearts Animation Container */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none overflow-visible w-24 h-24">
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ opacity: 1, y: 15, scale: 0.6, x: heart.x }}
              animate={{ opacity: 0, y: -50, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute text-lg will-change-transform"
            >
              {heart.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Floating Badge Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative flex items-center gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-neutral-950/85 hover:bg-neutral-900/95 border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all cursor-pointer ring-1 ring-white/5"
        role="button"
        aria-label="Live audience statistics"
      >
        {/* Glowing Pulsing Beacon */}
        <div className="relative flex items-center justify-center shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          </span>
        </div>

        {/* Live Equalizer Mini Bars */}
        <div className="hidden sm:flex items-end gap-0.5 h-3 shrink-0">
          <motion.div
            animate={{ height: ['4px', '12px', '6px', '14px', '8px'] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="w-0.5 bg-emerald-400 rounded-full"
          />
          <motion.div
            animate={{ height: ['10px', '5px', '14px', '7px', '11px'] }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
            className="w-0.5 bg-emerald-400/80 rounded-full"
          />
          <motion.div
            animate={{ height: ['6px', '14px', '8px', '12px', '5px'] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
            className="w-0.5 bg-emerald-400/90 rounded-full"
          />
        </div>

        {/* Counter Content */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1">
              <span>{isBn ? 'লাইভ শ্রোতা' : 'LIVE AUDIENCE'}</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs sm:text-sm font-black font-mono tracking-tight text-white drop-shadow-sm">
                {formatListenerCount(listenerCount, isBn)}
              </span>
              <span className="text-[9px] font-bold text-white/50 uppercase">
                {isBn ? 'জন' : ''}
              </span>
            </div>
          </div>

          {/* Fluctuating Delta Pill */}
          <AnimatePresence mode="wait">
            {lastDelta !== null && (
              <motion.span
                key={deltaKey}
                initial={{ opacity: 0, y: -4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full shrink-0 flex items-center ${
                  lastDelta > 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {lastDelta > 0 ? `+${isBn ? toBengaliDigits(lastDelta) : lastDelta}` : `${isBn ? toBengaliDigits(lastDelta) : lastDelta}`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Cheer Quick Tap Icon */}
        <button
          type="button"
          onClick={handleCheer}
          title={isBn ? 'তালি দিন / রিঅ্যাক্ট করুন' : 'Cheer the station'}
          className="ml-0.5 p-1 rounded-full bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400 transition-colors active:scale-90"
        >
          <Heart className="w-3 h-3 fill-rose-500/40 text-rose-400 group-hover:scale-110 transition-transform" />
        </button>

        {/* Dropdown Chevron */}
        <div className="text-white/40 group-hover:text-white transition-colors">
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </motion.div>

      {/* Expanded Popover with Detailed Audience Analytics */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-neutral-950/95 border border-white/10 backdrop-blur-2xl p-4 shadow-2xl space-y-3.5 z-50 text-left"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h5 className="text-xs font-black tracking-wide text-white uppercase">
                    {isBn ? 'রিয়েল-টাইম শ্রোতা অ্যানালিটিক্স' : 'Real-Time Audience'}
                  </h5>
                  <p className="text-[10px] text-emerald-400/90 font-medium font-mono">
                    {stationName} • {isBn ? 'জনপ্রিয়তার শীর্ষে' : 'Station Trending #1'}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold">
                HD 320k
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/40 block">
                  {isBn ? 'বর্তমান শ্রোতা' : 'Listening Now'}
                </span>
                <span className="text-base font-black font-mono text-emerald-400 block">
                  {formatListenerCount(listenerCount, isBn)}
                </span>
                <span className="text-[9px] text-white/50 block">
                  {isBn ? 'সক্রিয় সম্প্রচার' : 'Active Tune-ins'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/40 block">
                  {isBn ? 'আজকের সর্বোচ্চ' : 'Peak Today'}
                </span>
                <span className="text-base font-black font-mono text-white/90 block">
                  {formatListenerCount(peakCount, isBn)}
                </span>
                <span className="text-[9px] text-white/50 block">
                  {isBn ? 'রেকর্ড ট্রাফিক' : 'High Watermark'}
                </span>
              </div>
            </div>

            {/* Regional Listeners Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {isBn ? 'শ্রোতাদের আঞ্চলিক বণ্টন' : 'Regional Share'}
                </span>
                <span className="font-mono text-white/70">100%</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-white/80 mb-1">
                    <span>{isBn ? 'ঢাকা মেট্রো ও পার্শ্ববর্তী' : 'Dhaka Metro & Suburbs'}</span>
                    <span className="font-mono text-emerald-400 font-bold">62%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-white/80 mb-1">
                    <span>{isBn ? 'চট্টগ্রাম বন্দর ও বিভাগ' : 'Chittagong Division'}</span>
                    <span className="font-mono text-cyan-400 font-bold">18%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-white/80 mb-1">
                    <span>{isBn ? 'সিলেট, রাজশাহী ও অন্যান্য' : 'Sylhet, Rajshahi & Others'}</span>
                    <span className="font-mono text-amber-400 font-bold">12%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-medium text-white/80 mb-1">
                    <span>{isBn ? 'প্রবাসী বাংলাদেশি শ্রোতা' : 'Expat & Global Diaspora'}</span>
                    <span className="font-mono text-purple-400 font-bold">8%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Cheer CTA Banner */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="text-[10px] text-white/60 leading-tight">
                <span className="font-bold text-white block">
                  {isBn ? 'অনুষ্ঠানে উৎসাহ দিন' : 'Cheer this broadcast'}
                </span>
                <span>{isBn ? `${toBengaliDigits(cheerCount)} জন লাভ রিঅ্যাকশন দিয়েছেন` : `${cheerCount} studio cheers sent`}</span>
              </div>

              <button
                type="button"
                onClick={handleCheer}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-extrabold text-[11px] tracking-wide transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isBn ? 'তালি দিন' : 'Cheer'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
