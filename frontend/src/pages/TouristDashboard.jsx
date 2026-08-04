import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useLanguage } from '../context/LanguageContext';
import MapComponent from '../components/MapComponent';
import { 
  Shield, AlertCircle, Trash2, 
  HeartHandshake, Search, CheckCircle, Navigation
} from 'lucide-react';

const destinationsDb = [
  { name: "Jaipur", temp: "36°C", condition: "Dry & Clear", score: 72, advisory: "Watch out for persistent street vendors and fake guide scams.", risk: "Moderate Risk" },
  { name: "Delhi", temp: "38°C", condition: "Sunny", score: 92, advisory: "Highly secure embassy lanes. Keep bags zipped in local bazaars.", risk: "Safe" },
  { name: "Goa", temp: "30°C", condition: "Overcast", score: 84, advisory: "Pay attention to tide warning flags; avoid dark beaches at night.", risk: "Safe" },
  { name: "Mumbai", temp: "29°C", condition: "Monsoon", score: 88, advisory: "Safe tourist stretch. Always ride prepaid meter taxis.", risk: "Safe" }
];

export default function TouristDashboard() {
  const { user, token, updateEmergencyContacts } = useAuthStore();
  const { triggerSOS, submitScamReport, zones, alerts, triggerToast } = useAppStore();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState(destinationsDb[0]);

  // Contact form
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRel, setNewContactRel] = useState('');

  // Scam form
  const [scamCategory, setScamCategory] = useState('Fake Guide');
  const [scamDesc, setScamDesc] = useState('');
  const [scamAddr, setScamAddr] = useState('');
  const [scamLat, setScamLat] = useState('26.9239');
  const [scamLng, setScamLng] = useState('75.8267');

  // Blockchain Identity states
  const [isGeneratingBlock, setIsGeneratingBlock] = useState(false);
  const [blockchainRecord, setBlockchainRecord] = useState(user?.touristProfile?.blockchainID || null);

  const handleSOS = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await triggerSOS(token, pos.coords.latitude, pos.coords.longitude);
          } catch (e) {
            triggerToast('SOS broadcast failed', 'critical');
          }
        },
        async () => {
          // Fallback coords
          await triggerSOS(token, 26.9124, 75.7873);
        }
      );
    } else {
      await triggerSOS(token, 26.9124, 75.7873);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    const currentContacts = user?.emergencyContacts || [];
    const updated = [
      ...currentContacts.map(c => ({ name: c.name, phone: c.phone, relationship: c.relationship || '' })),
      { name: newContactName, phone: newContactPhone, relationship: newContactRel }
    ];

    try {
      await updateEmergencyContacts(updated);
      setNewContactName('');
      setNewContactPhone('');
      setNewContactRel('');
      triggerToast('Emergency contact added', 'success');
    } catch (err) {
      triggerToast('Failed to add contact', 'critical');
    }
  };

  const handleRemoveContact = async (index) => {
    const currentContacts = user?.emergencyContacts || [];
    const updated = currentContacts
      .filter((_, i) => i !== index)
      .map(c => ({ name: c.name, phone: c.phone, relationship: c.relationship || '' }));

    try {
      await updateEmergencyContacts(updated);
      triggerToast('Emergency contact removed', 'success');
    } catch (err) {
      triggerToast('Failed to delete contact', 'critical');
    }
  };

  const handleScamSubmit = async (e) => {
    e.preventDefault();
    if (!scamDesc || !scamAddr) return triggerToast('All fields required', 'warning');
    
    try {
      await submitScamReport(token, {
        category: scamCategory,
        description: scamDesc,
        address: scamAddr,
        lat: Number(scamLat),
        lng: Number(scamLng)
      });
      setScamDesc('');
      setScamAddr('');
      triggerToast('Scam incident filed with central dispatcher!', 'success');
    } catch (err) {
      triggerToast('Scam filing failed', 'critical');
    }
  };

  const generateBlockchainID = () => {
    setIsGeneratingBlock(true);
    setTimeout(() => {
      const mockHash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockTx = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setBlockchainRecord({
        userHash: mockHash,
        blockNumber: Math.floor(Math.random() * 500000) + 19000000,
        transactionHash: mockTx,
        verifiedAt: new Date().toISOString()
      });
      setIsGeneratingBlock(false);
      triggerToast('Simulated blockchain ID verification generated!', 'success');
    }, 2000);
  };

  const handleSearch = () => {
    const found = destinationsDb.find(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (found) setSelectedDest(found);
    else triggerToast('Destination index not found. Searching nearby...', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#02050a] text-slate-800 dark:text-slate-100 py-8 px-4 md:px-8 relative overflow-hidden transition-colors duration-500">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Main Header / SOS Beacon */}
        <div className="lg:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t.welcome}, {user?.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Country: {user?.touristProfile?.nationality || 'Explorer'} | Status: SECURE</p>
          </div>
          
          {/* Urgent SOS Button */}
          <button
            onClick={handleSOS}
            className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-red-650 to-rose-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-red-500/45 hover:scale-105 transition-all flex items-center justify-center gap-2 animate-pulse"
          >
            <Shield className="w-5 h-5" />
            Trigger Emergency SOS
          </button>
        </div>

        {/* Live Safety Index Rating & Destination search */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Destination Search widget */}
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl backdrop-blur-xl space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              Check regional safety rating
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Goa, Jaipur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
              />
              <button
                onClick={handleSearch}
                className="bg-brand-650 hover:bg-brand-600 text-white font-bold text-xs px-4 rounded-xl"
              >
                Search
              </button>
            </div>

            {selectedDest && (
              <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{selectedDest.name}</h4>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                    selectedDest.score >= 80 ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-650 dark:text-emerald-400' : 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/30 text-amber-650 dark:text-amber-400'
                  }`}>
                    {selectedDest.risk}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <p>Temp: <span className="text-slate-900 dark:text-white font-semibold">{selectedDest.temp}</span></p>
                  <p>Advisory Index: <span className="text-slate-900 dark:text-white font-semibold">{selectedDest.score}%</span></p>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold italic">
                  Advisory: {selectedDest.advisory}
                </p>
              </div>
            )}
          </div>

          {/* Blockchain Verification Widget */}
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl backdrop-blur-xl space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              Blockchain identity verifier
            </h3>
            
            {blockchainRecord ? (
              <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between text-slate-800 dark:text-white font-bold mb-1">
                  <span>Status:</span>
                  <span className="text-emerald-655 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> SECURE BLOCK
                  </span>
                </div>
                <p className="break-all font-mono text-[9px] bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200"><span className="text-slate-500 block font-bold mb-0.5">USER BLOCK HASH:</span>{blockchainRecord.userHash}</p>
                <p className="break-all font-mono text-[9px] bg-slate-100 dark:bg-slate-950 p-2 rounded border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200"><span className="text-slate-500 block font-bold mb-0.5">TRANSACTION LOG HASH:</span>{blockchainRecord.transactionHash}</p>
                <p className="flex justify-between text-[10px]"><span className="font-semibold text-slate-500">Block height:</span> <span className="text-slate-800 dark:text-slate-200">{blockchainRecord.blockNumber}</span></p>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-[11px] text-slate-500 font-semibold">Your identity profile is not locked on the security ledger chain.</p>
                <button
                  onClick={generateBlockchainID}
                  disabled={isGeneratingBlock}
                  className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs py-2 rounded-xl transition-all border border-slate-200 dark:border-white/5"
                >
                  {isGeneratingBlock ? 'Securing Ledger block...' : 'Verify Blockchain ID'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Dynamic GIS Safety map component */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-5 rounded-2xl backdrop-blur-xl space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Navigation className="w-4.5 h-4.5 text-brand-500" />
              Live GIS Radar Map
            </h3>
            <div className="h-[350px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/5">
              <MapComponent />
            </div>
          </div>
        </div>

        {/* Bottom section: Emergency contacts & Scam radar reporter */}
        <div className="lg:col-span-6 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <HeartHandshake className="w-4.5 h-4.5 text-brand-500 dark:text-brand-400" />
            {t("dashboards.emergencyContacts")}
          </h3>

          <form onSubmit={handleAddContact} className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder={t("dashboards.contactName")}
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
            />
            <input
              type="text"
              placeholder={t("dashboards.contactPhone")}
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
            />
            <input
              type="text"
              placeholder={t("dashboards.contactRel")}
              value={newContactRel}
              onChange={(e) => setNewContactRel(e.target.value)}
              className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              className="col-span-3 bg-brand-650 hover:bg-brand-600 text-white font-bold text-xs py-2 rounded-xl transition-all"
            >
              {t("dashboards.addContact")}
            </button>
          </form>

          <div className="space-y-2 pt-2 max-h-[200px] overflow-y-auto pr-1">
            {user?.emergencyContacts && user.emergencyContacts.length > 0 ? (
              user.emergencyContacts.map((contact, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-100/60 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{contact.name} ({contact.relationship})</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{contact.phone}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveContact(i)}
                    className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-555 italic">
                {t("dashboards.noFamilyCircle") || "No family circles registered. Standard local backup notifications will dial central tourist police cells."}
              </p>
            )}
          </div>
        </div>

        {/* Scam radar reporter */}
        <div className="lg:col-span-6 bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
            {t("dashboards.scamReporting")}
          </h3>

          <form onSubmit={handleScamSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("dashboards.scamCategory")}</label>
                <select
                  value={scamCategory}
                  onChange={(e) => setScamCategory(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Fake Guide" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fake Guide</option>
                  <option value="Overcharging" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Overcharging</option>
                  <option value="Fake Taxi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fake Taxi</option>
                  <option value="Pickpocketing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pickpocketing</option>
                  <option value="Vendor Harassment" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Vendor Harassment</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("dashboards.scamAddr")}</label>
                <input
                  type="text"
                  placeholder="Address or monument spot"
                  value={scamAddr}
                  onChange={(e) => setScamAddr(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t("dashboards.scamDesc")}</label>
              <textarea
                placeholder="Give details of the fraud, pricing demands, or operator..."
                rows={2}
                value={scamDesc}
                onChange={(e) => setScamDesc(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-855 dark:text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all"
            >
              {t("dashboards.submitReport")}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
