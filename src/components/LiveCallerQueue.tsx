import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall, PhoneIncoming, MapPin, Radio, Users, Sparkles,
  ChevronDown, ChevronUp, User, Mic, Clock, CheckCircle2,
  Plus, Send, X, Volume2, Signal, AlertCircle
} from 'lucide-react';

export interface Caller {
  id: string;
  name: string;
  location: string;
  avatarUrl: string;
  iconType: 'pin' | 'mic' | 'radio' | 'city';
  topic: string;
  status: 'on_air' | 'next_up' | 'screening' | 'waiting';
  waitingSinceSeconds: number;
  isUser?: boolean;
}

interface LiveCallerQueueProps {
  currentStationId?: string;
  currentStationName?: string;
  uiLang?: 'bn' | 'en';
  activeSpeakerName?: string;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"
];

const STATION_POOLS: Record<string, Array<{ name: string; location: string; topicBn: string; topicEn: string }>> = {
  dhaka: [
    { name: "ফাহিম আহমেদ", location: "মিরপুর ১০, ঢাকা", topicBn: "মেট্রোরেলে অফিস যাতায়াতের সময় বাঁচানোর অভিজ্ঞতা", topicEn: "Saving 2 hours daily using Dhaka Metro Rail" },
    { name: "নাবিলা রহমান", location: "ধানমন্ডি ২৭, ঢাকা", topicBn: "ফিডার রোড ও রিকশার জ্যাম নিয়ে সমাধান প্রস্তাব", topicEn: "Feeder road rickshaw congestions & solutions" },
    { name: "রাফসান করিম", location: "উত্তরা ৪ নম্বর সেক্টর", topicBn: "এলিভেটেড এক্সপ্রেসওয়ের দ্রুতগতির সুবিধা", topicEn: "Elevated expressway speed benefits for airport commuters" },
    { name: "সামিয়া হক", location: "গুলশান ১, ঢাকা", topicBn: "নতুন ঢাকার ফুড কালচার ও ক্যাফে আড্ডা", topicEn: "Gulshan café culture vs street food" },
    { name: "ইমরান হোসেন", location: "নাজিরাবাজার, পুরান ঢাকা", topicBn: "খাঁটি বাসমতি কাচ্চি বিরিয়ানির ঐতিহ্যবাহী স্বাদ", topicEn: "Heritage Nazirabazar authentic kacchi biryani" },
    { name: "তানভীর হাসান", location: "কারওয়ান বাজার, ঢাকা", topicBn: "বাংলাদেশি টেক স্টার্টআপদের এআই টুল ব্যবহারের অভিজ্ঞতা", topicEn: "Tech startup experience leveraging AI coding tools" },
  ],
  ctg: [
    { name: "তানজিলা আক্তার", location: "জিইসি মোড়, চট্টগ্রাম", topicBn: "বন্দর নগরী চট্টগ্রামে দ্রুত মেট্রোরেল চালুর দাবি", topicEn: "Demand for Metro Rail system in Chittagong port city" },
    { name: "মাহিনুল ইসলাম", location: "আগ্রাবাদ বাণিজ্যিক এলাকা", topicBn: "চট্টগ্রামের শিপিং ব্যবসা ও ডিজিটাল কাস্টমস", topicEn: "Chittagong port digital logistics and customs" },
    { name: "রিফাত চৌধুরী", location: "নাসিরাবাদ, চট্টগ্রাম", topicBn: "চট্টগ্রামের ঐতিহ্যবাহী মেজবানি মাংসের স্বাদ", topicEn: "Traditional Chittagong Mezban beef culinary heritage" },
  ],
  sylhet: [
    { name: "অনন্যা সিনহা", location: "জিন্দাবাজার, সিলেট", topicBn: "সিলেটি তরুণদের আন্তর্জাতিক রিমোট ওয়ার্ক ও ইউআই ডিজাইন", topicEn: "Sylhet UI/UX designers working for global clients" },
    { name: "তাহমিদ জামান", location: "আম্বরখানা, সিলেট", topicBn: "চা বাগান ইকো-ট্যুরিজম ও লোকাল পরিবেশ রক্ষা", topicEn: "Tea garden eco-tourism and environmental preservation" },
    { name: "সাদিয়া পারভীন", location: "শাহজালাল উপশহর, সিলেট", topicBn: "প্রবাসী রেমিট্যান্স ও ডিজিটাল ব্যাংকিং সুবিধা", topicEn: "Remittance inflows and mobile financial services" },
  ],
  rajshahi: [
    { name: "সাদমান শাকিল", location: "তালাইমারী, রাজশাহী", topicBn: "রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাসে ফ্রিল্যান্সিং হাব", topicEn: "Rajshahi University students freelancing hub" },
    { name: "আরিফুর রহমান", location: "সাহেব বাজার, রাজশাহী", topicBn: "গ্রিন সিটি রাজশাহীর পরিচ্ছন্ন নাগরিক জীবন", topicEn: "Green and clean city civic management of Rajshahi" },
    { name: "মেহজাবিন আলম", location: "মতিহার, রাজশাহী", topicBn: "রেশম শিল্প ও আধুনিক ই-কমার্স মার্কেটপ্লেস", topicEn: "Silk cottage industry digital transformation" },
  ]
};

export function LiveCallerQueue({
  currentStationId = 'dhaka',
  currentStationName = 'ঢাকা ৯৮.৪ FM',
  uiLang = 'bn',
  activeSpeakerName = ''
}: LiveCallerQueueProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialModalOpen, setIsDialModalOpen] = useState(false);
  const [callerNameInput, setCallerNameInput] = useState('');
  const [callerLocInput, setCallerLocInput] = useState('');
  const [callerTopicInput, setCallerTopicInput] = useState('');
  const [userSubmitted, setUserSubmitted] = useState(false);

  const [callers, setCallers] = useState<Caller[]>([
    {
      id: 'caller-1',
      name: 'ফাহিম আহমেদ',
      location: 'মিরপুর ১০, ঢাকা',
      avatarUrl: AVATARS[0],
      iconType: 'mic',
      topic: 'মেট্রোরেলে অফিস যাতায়াতের সময় বাঁচানোর অভিজ্ঞতা',
      status: 'on_air',
      waitingSinceSeconds: 45,
    },
    {
      id: 'caller-2',
      name: 'নাবিলা রহমান',
      location: 'ধানমন্ডি ২৭, ঢাকা',
      avatarUrl: AVATARS[1],
      iconType: 'pin',
      topic: 'ফিডার রোড ও রিকশার জ্যাম নিয়ে নাগরিক সমাধান',
      status: 'next_up',
      waitingSinceSeconds: 120,
    },
    {
      id: 'caller-3',
      name: 'রাফসান করিম',
      location: 'উত্তরা ৪ নম্বর সেক্টর',
      avatarUrl: AVATARS[2],
      iconType: 'city',
      topic: 'এলিভেটেড এক্সপ্রেসওয়ের দ্রুতগতির অভিজ্ঞতা',
      status: 'screening',
      waitingSinceSeconds: 240,
    },
    {
      id: 'caller-4',
      name: 'তানজিলা আক্তার',
      location: 'জিইসি মোড়, চট্টগ্রাম',
      avatarUrl: AVATARS[3],
      iconType: 'radio',
      topic: 'চট্টগ্রামেও দ্রুত মেট্রোরেল সম্প্রসারণের দাবি',
      status: 'waiting',
      waitingSinceSeconds: 310,
    },
    {
      id: 'caller-5',
      name: 'সাদমান শাকিল',
      location: 'তালাইমারী, রাজশাহী',
      avatarUrl: AVATARS[4],
      iconType: 'pin',
      topic: 'এআই কোডিং অ্যাসিস্ট্যান্ট দিয়ে তরুণদের কাজের বিপ্লব',
      status: 'waiting',
      waitingSinceSeconds: 430,
    }
  ]);

  // Periodic wait-time counter and simulated caller rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCallers(prev => prev.map(c => ({
        ...c,
        waitingSinceSeconds: c.waitingSinceSeconds + 1
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic simulated queue progression every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCallers(prev => {
        if (prev.length === 0) return prev;

        const pool = STATION_POOLS[currentStationId] || STATION_POOLS['dhaka'];
        const randomTemplate = pool[Math.floor(Math.random() * pool.length)];
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const icons: Array<'pin' | 'mic' | 'radio' | 'city'> = ['pin', 'mic', 'radio', 'city'];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];

        // Move queue forward:
        // On air caller retires or gets replaced by next_up
        const updated = [...prev];
        const nextUpIdx = updated.findIndex(c => c.status === 'next_up');
        const screeningIdx = updated.findIndex(c => c.status === 'screening');
        const waitingIdx = updated.findIndex(c => c.status === 'waiting');

        if (nextUpIdx !== -1) {
          // Promote next_up to on_air (unless current on_air is user)
          const currentOnAirIdx = updated.findIndex(c => c.status === 'on_air');
          if (currentOnAirIdx !== -1 && !updated[currentOnAirIdx].isUser) {
            updated.splice(currentOnAirIdx, 1);
          }
        }

        // Promote first available to next_up & on_air
        if (updated.length > 0) {
          updated[0].status = 'on_air';
        }
        if (updated.length > 1) {
          updated[1].status = 'next_up';
        }
        if (updated.length > 2) {
          updated[2].status = 'screening';
        }

        // Add a new incoming caller if queue is small (< 6)
        if (updated.length < 6) {
          const newId = `caller-${Date.now()}`;
          updated.push({
            id: newId,
            name: randomTemplate.name,
            location: randomTemplate.location,
            avatarUrl: randomAvatar,
            iconType: randomIcon,
            topic: uiLang === 'bn' ? randomTemplate.topicBn : randomTemplate.topicEn,
            status: 'waiting',
            waitingSinceSeconds: Math.floor(Math.random() * 30) + 10,
          });
        }

        return updated;
      });
    }, 22000);

    return () => clearInterval(interval);
  }, [currentStationId, uiLang]);

  const handleDialIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerNameInput.trim()) return;

    const userCaller: Caller = {
      id: `user-caller-${Date.now()}`,
      name: callerNameInput.trim(),
      location: callerLocInput.trim() || (uiLang === 'bn' ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"),
      avatarUrl: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      iconType: 'mic',
      topic: callerTopicInput.trim() || (uiLang === 'bn' ? "সরাসরি আরজের সাথে লাইভ আলোচনা" : "Live discussion with the RJ"),
      status: 'screening',
      waitingSinceSeconds: 0,
      isUser: true,
    };

    setCallers(prev => [prev[0], userCaller, ...prev.slice(1)]);
    setUserSubmitted(true);
    setTimeout(() => {
      setIsDialModalOpen(false);
      setUserSubmitted(false);
      setCallerNameInput('');
      setCallerLocInput('');
      setCallerTopicInput('');
      setIsExpanded(true);
    }, 1500);
  };

  const formatWait = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: Caller['status']) => {
    switch (status) {
      case 'on_air':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold text-[9px] tracking-wider uppercase font-mono animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {uiLang === 'bn' ? 'অন-এয়ার' : 'ON AIR'}
          </span>
        );
      case 'next_up':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[9px] tracking-wider uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {uiLang === 'bn' ? 'পরবর্তী' : 'NEXT UP'}
          </span>
        );
      case 'screening':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold text-[9px] tracking-wider uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            {uiLang === 'bn' ? 'স্ক্রিনিং' : 'SCREENING'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 font-bold text-[9px] tracking-wider uppercase font-mono">
            <Clock className="w-2.5 h-2.5" />
            {uiLang === 'bn' ? 'অপেক্ষমাণ' : 'WAITING'}
          </span>
        );
    }
  };

  return (
    <div className="relative z-30 w-full select-none">
      {/* Switchboard Header Toggle Bar */}
      <div className="bg-[#121212]/90 border border-white/10 backdrop-blur-2xl rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <PhoneIncoming className="w-4 h-4 animate-bounce" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 truncate">
                <span>{uiLang === 'bn' ? 'লাইভ কলার সুইচবোর্ড' : 'Live Caller Queue'}</span>
              </span>
              <span className="px-2 py-0.2 rounded-full bg-white/10 text-white/70 text-[9px] font-mono font-bold">
                {callers.length} {uiLang === 'bn' ? 'জন' : 'CALLERS'}
              </span>
            </div>
            <p className="text-[10px] text-white/45 truncate mt-0.5 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>{currentStationName}</span>
              <span className="text-white/20">•</span>
              <span className="text-emerald-400/90 font-medium font-mono">
                {uiLang === 'bn' ? 'স্টুডিও লাইন খোলা' : 'Lines Open'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDialModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 active:scale-95 text-white font-extrabold text-[11px] tracking-wide transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{uiLang === 'bn' ? 'কল করুন' : 'Dial In'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white/70 hover:text-white border border-white/5 flex items-center justify-center transition-all cursor-pointer"
            title={isExpanded ? "Collapse Queue" : "Expand Queue"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Caller List Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-2"
          >
            <div className="bg-[#0d0d0d]/95 border border-white/10 backdrop-blur-3xl rounded-2xl p-3 md:p-4 space-y-2.5 shadow-2xl max-h-[360px] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {uiLang === 'bn' ? 'স্টুডিওতে অপেক্ষমাণ কলার্স তালিকা' : 'Active Caller Switchboard'}
                </span>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {uiLang === 'bn' ? 'সরাসরি আরজে আড্ডা' : 'Studio Intercom'}
                </span>
              </div>

              <div className="space-y-2">
                {callers.map((caller, index) => {
                  const isOnAir = caller.status === 'on_air';

                  return (
                    <motion.div
                      key={caller.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                        isOnAir
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                          : caller.isUser
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar Image with Active Glow Ring */}
                        <div className="relative shrink-0">
                          <img
                            src={caller.avatarUrl}
                            alt={caller.name}
                            className={`w-10 h-10 rounded-full object-cover border-2 ${
                              isOnAir ? 'border-emerald-400' : 'border-white/20'
                            }`}
                          />
                          {isOnAir && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                            </span>
                          )}
                        </div>

                        {/* Caller Meta & Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">
                                {caller.name}
                              </h4>
                              {caller.isUser && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[8px] font-extrabold uppercase font-mono">
                                  {uiLang === 'bn' ? 'আপনি' : 'YOU'}
                                </span>
                              )}
                            </div>
                            {getStatusBadge(caller.status)}
                          </div>

                          {/* Location with Pin Icon */}
                          <div className="flex items-center gap-1 text-[10px] text-white/55 font-medium mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                            <span>{caller.location}</span>
                            <span className="text-white/20 mx-1">•</span>
                            <span className="font-mono text-white/40 text-[9px]">
                              {formatWait(caller.waitingSinceSeconds)} {uiLang === 'bn' ? 'অপেক্ষা' : 'wait'}
                            </span>
                          </div>

                          {/* Topic Quote */}
                          <p className="text-[11px] text-white/75 mt-1.5 line-clamp-1 italic bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                            "{caller.topic}"
                          </p>
                        </div>
                      </div>

                      {/* Equalizer Wave bar on Air */}
                      {isOnAir && (
                        <div className="mt-2.5 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3 animate-pulse" />
                            <span>{uiLang === 'bn' ? 'লাইভ লাইনে যুক্ত' : 'Connected to Host Microphone'}</span>
                          </span>
                          <div className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce delay-75" />
                            <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce delay-150" />
                            <span className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                            <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce delay-300" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dial In Modal */}
      <AnimatePresence>
        {isDialModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#111111] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setIsDialModalOpen(false)}
                className="absolute top-5 right-5 text-white/40 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black shadow-lg">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {uiLang === 'bn' ? 'রেডিও স্টুডিওতে কল করুন' : 'Dial In to Studio Line'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {currentStationName} • {uiLang === 'bn' ? 'লাইভ কলার কিউতে যুক্ত হোন' : 'Join the live queue'}
                  </p>
                </div>
              </div>

              {userSubmitted ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-white">
                    {uiLang === 'bn' ? 'কল সফলভাবে যুক্ত হয়েছে!' : 'Call Added to Queue!'}
                  </h4>
                  <p className="text-xs text-white/60">
                    {uiLang === 'bn'
                      ? 'প্রযোজক আপনার লাইনটি স্ক্রিনিং করছেন। শীঘ্রই অন-এয়ারে যাবেন।'
                      : 'The producer is screening your line. You will be patched through shortly.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDialIn} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                      {uiLang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={uiLang === 'bn' ? 'যেমন: অন্তু রহমান' : 'e.g. Antu Rahman'}
                      value={callerNameInput}
                      onChange={(e) => setCallerNameInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                      {uiLang === 'bn' ? 'আপনার এলাকা / জেলা' : 'Your District / Area'}
                    </label>
                    <input
                      type="text"
                      placeholder={uiLang === 'bn' ? 'যেমন: ধানমন্ডি ২৭, ঢাকা / চট্টগ্রাম জিইসি' : 'e.g. Dhanmondi, Dhaka / Chittagong'}
                      value={callerLocInput}
                      onChange={(e) => setCallerLocInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                      {uiLang === 'bn' ? 'আপনি কোন বিষয়ে কথা বলতে চান?' : 'What would you like to discuss?'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={uiLang === 'bn' ? 'আপনার মতামত বা অভিজ্ঞতা সংক্ষেপে লিখুন...' : 'Briefly share your thoughts on the topic...'}
                      value={callerTopicInput}
                      onChange={(e) => setCallerTopicInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDialModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {uiLang === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                    >
                      {uiLang === 'bn' ? 'কল দিন' : 'Join Queue'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
