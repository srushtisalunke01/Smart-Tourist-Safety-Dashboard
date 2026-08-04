import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, Plus, Sparkles, MapPin, AlertCircle, Image, CheckCircle, Clock, AlertOctagon, Activity } from 'lucide-react';
import MapComponent from '../components/MapComponent';

const categories = ['Overcharging', 'Fake Guide', 'Fake Taxi', 'Shopping Fraud', 'Pickpocketing', 'Other'];

const ScamRadar = () => {
  const { scams, hotspots, submitScamReport, triggerToast } = useApp();
  const { t } = useLanguage();

  const [category, setCategory] = useState('Overcharging');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !address) return triggerToast('Form inputs required', 'warning');
    
    setLoading(true);
    try {
      // Create FormData to support image uploads
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      formData.append('address', address);
      if (lat) formData.append('lat', Number(lat));
      if (lng) formData.append('lng', Number(lng));
      if (imageFile) formData.append('image', imageFile);

      await submitScamReport(formData);
      
      setDescription('');
      setAddress('');
      setLat('');
      setLng('');
      setImageFile(null);
      setImagePreview('');
      triggerToast('Incident report logged successfully!', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Submission error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Title Header */}
      <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 w-36 h-36 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-brand-500 animate-pulse" />
            {t('scamTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Browse verified tourist traps or report financial fraud incidents to alert other travelers.
          </p>
        </div>
      </div>

      {/* 2. Interactive Map & Simulated 3D Location Spot */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-500" />
          Interactive Safe Map Tracker
        </h3>
        <MapComponent center={[28.6139, 77.2090]} zoom={12} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side setup forms */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-955 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-brand-500" />
              {t("dashboards.scamReporting")}
            </h3>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("dashboards.scamCategory")}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs py-2.5 px-3 rounded-xl focus:border-brand-500 focus:outline-none font-bold shadow-md cursor-pointer hover:border-brand-400 transition-all"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("dashboards.scamDesc")}</label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details of scam, guide behaviour, amount overcharged, taxi details..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 placeholder-slate-400 font-semibold shadow-inner"
              ></textarea>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("dashboards.scamAddr")}</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-550" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Qutub Minar outer exit, Delhi"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-semibold shadow-inner"
                />
              </div>
            </div>

            {/* Coords */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("latitude") || "Latitude"}</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g., 28.5255"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-inner"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("longitude") || "Longitude"}</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g., 77.1865"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 shadow-inner"
                />
              </div>
            </div>

            {/* Photo upload */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("photoUpload") || "Attach Incident photo"}</label>
              <div className="flex items-center gap-3">
                <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all font-bold shadow-sm">
                  <Image className="w-4.5 h-4.5" />
                  {t("selectFile") || "Select File"}
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-white/15" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all cursor-pointer uppercase tracking-wider"
            >
              {loading ? 'Submitting...' : t("dashboards.submitReport")}
            </button>
          </form>

          {/* AI Hotspots index summary */}
          <div className="glass border border-slate-200 dark:border-white/10 p-5 rounded-3xl space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-white/5 pb-2">
              <Sparkles className="w-4.5 h-4.5 text-brand-500" />
              AI Hotspot Clusters ({hotspots.length})
            </h4>
            
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {hotspots.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-medium py-4 text-center">AI scanning active. No high scam coordinates cluster detected.</p>
              ) : (
                hotspots.map((hs, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-2.5 rounded-xl text-[10px] space-y-1">
                    <p className="text-caution-600 dark:text-caution-400 font-black flex items-center justify-between">
                      <span>⚠️ {hs.primaryThreat} threat corridor</span>
                      <span>{hs.reportCount} reports</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-normal font-semibold">{hs.advisory}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Incident feed list */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-950 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4.5 h-4.5 text-brand-500" />
            Recent Tourist Submissions ({scams.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {scams.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center col-span-2">No scam reports filed yet.</p>
            ) : (
              scams.map((scam) => (
                <div key={scam._id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden hover:border-slate-350 dark:hover:border-white/10 transition-all flex flex-col justify-between shadow-sm">
                  {/* Photo if exists */}
                  {scam.imageUrl && (
                    <img src={scam.imageUrl} alt="Incident" className="w-full h-32 object-cover border-b border-slate-200 dark:border-white/5" />
                  )}
                  
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-caution-500/10 text-caution-600 dark:text-caution-400 border border-caution-500/20">
                          {scam.category}
                        </span>
                        
                        <span className={`text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                          scam.status === 'verified' ? 'text-safe-600 dark:text-safe-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {scam.status === 'verified' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-safe-500" />
                              {t('verifiedStatus')}
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-slate-500 animate-spin-slow" />
                              {t('pendingStatus')}
                            </>
                          )}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{scam.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/5 text-[9px] text-slate-550 dark:text-slate-400 font-semibold space-y-1">
                      <p className="flex items-center gap-1 max-w-[220px] truncate">
                        <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                        {scam.address}
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{new Date(scam.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ScamRadar;
