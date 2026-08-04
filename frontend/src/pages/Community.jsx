import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Heart, Star, Sparkles, Plus, MapPin, Award, CheckCircle, Send, Edit, Trash2, Search, Upload } from 'lucide-react';
import api from '../services/api';

const Community = () => {
  const { posts, submitCommunityPost, likePost, commentOnPost, deleteCommunityPost, editCommunityPost, triggerToast } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [safetyRating, setSafetyRating] = useState(5);
  const [experienceRating, setExperienceRating] = useState(5);
  
  const [editingPostId, setEditingPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!title || !content || !location) return triggerToast('Please enter title, content, and location details', 'warning');
    
    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (editingPostId) {
        uploadedImageUrl = posts.find(p => p._id === editingPostId)?.imageUrl || '';
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedImageUrl = uploadRes.data.url;
        } catch (uploadErr) {
          console.error(uploadErr);
          triggerToast('Failed to upload image. Submitting without it.', 'warning');
        }
      }

      if (editingPostId) {
        await editCommunityPost(editingPostId, {
          title,
          content,
          location,
          safetyRating: Number(safetyRating),
          experienceRating: Number(experienceRating),
          imageUrl: uploadedImageUrl
        });
        setEditingPostId(null);
      } else {
        await submitCommunityPost({
          title,
          content,
          location,
          safetyRating: Number(safetyRating),
          experienceRating: Number(experienceRating),
          imageUrl: uploadedImageUrl
        });
      }
      setTitle('');
      setContent('');
      setLocation('');
      setSafetyRating(5);
      setExperienceRating(5);
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setTitle(post.title);
    setContent(post.content);
    setLocation(post.location || '');
    setSafetyRating(post.safetyRating || 5);
    setExperienceRating(post.experienceRating || 5);
    setImagePreview(post.imageUrl || '');
    setImageFile(null);
    // Smooth scroll to the editor form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setTitle('');
    setContent('');
    setLocation('');
    setSafetyRating(5);
    setExperienceRating(5);
    setImageFile(null);
    setImagePreview('');
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this travel log review?')) {
      try {
        await deleteCommunityPost(postId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      await commentOnPost(postId, commentText);
      setCommentInputs({ ...commentInputs, [postId]: '' });
      triggerToast('Comment added.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'fill-caution-500 text-caution-500' : 'text-slate-650'}`} />
    ));
  };

  const filteredPosts = (posts || []).filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.location?.toLowerCase().includes(query) ||
      post.user?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-500">
      
      {/* 1. Header Banner */}
      <div className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute right-0 top-0 w-36 h-36 bg-brand-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7 text-brand-500 animate-pulse-slow" />
            {t("community.reviewBoard")}
          </h2>
          <p className="text-xs text-slate-550 dark:text-slate-400 font-medium">
            Share local safety feedback, post reviews, answer tourist questions, and showcase eco-travel badges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Create/Edit Post Form & Badges List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Post Builder Form */}
          <form onSubmit={handleSubmitPost} className="glass border border-slate-200 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-brand-500" />
              {editingPostId ? 'Edit Travel Log Review' : t("community.writeReview")}
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("community.reviewTitle")}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Goa beach safety at night"
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("community.reviewDesc")}</label>
              <textarea
                required
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share helpful safety tips, food guides, and travel advisories here..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 placeholder-slate-500 font-semibold"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t("community.travelLocation")}</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Calangute, Goa"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-805 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>
            </div>

            {/* Star ratings inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t("community.safetyRating")}</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setSafetyRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${num <= safetyRating ? 'fill-caution-500 text-caution-500' : 'text-slate-450 dark:text-slate-650'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">{t("community.experienceRating") || "Experience Rating"}</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setExperienceRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${num <= experienceRating ? 'fill-caution-500 text-caution-500' : 'text-slate-450 dark:text-slate-655'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Real File Upload Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-brand-500" />
                {t("photoUpload") || "Upload Experience Image"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImageFile(file);
                  if (file) {
                    setImagePreview(URL.createObjectURL(file));
                  } else {
                    setImagePreview('');
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
              />
              {imagePreview && (
                <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 h-32 w-full">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-0.5 hover:scale-105 transition-transform text-[9px] font-black"
                  >
                    {t("dashboards.removeContact") || "Remove"}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Saving...' : editingPostId ? 'Update Experience Review' : t("community.publishBtn")}
              </button>

              {editingPostId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-350 dark:border-white/5"
                >
                  {t("cancel") || "Cancel Edit"}
                </button>
              )}
            </div>
          </form>

          {/* Eco Badges panel */}
          <div className="glass border border-slate-200 dark:border-white/10 p-5 rounded-3xl space-y-4 shadow-xl">
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-200 dark:border-white/5 pb-2">
              <Award className="w-4.5 h-4.5 text-brand-500 animate-bounce" />
              {t('badgesTitle')}
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-500 shrink-0 text-xl">🌱</div>
                <div>
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{t("badges.greenCommuter") || "Green Commuter Certificate"}</h5>
                  <p className="text-[9px] text-slate-550 dark:text-slate-400">{t("badges.greenCommuterDesc") || "Awarded for utilizing Public Metro/Bus guides in itineraries"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/35 flex items-center justify-center text-indigo-500 shrink-0 text-xl">🏛️</div>
                <div>
                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{t("badges.culturalPreservation") || "Cultural Preservation Badge"}</h5>
                  <p className="text-[9px] text-slate-555 dark:text-slate-400">{t("badges.culturalPreservationDesc") || "Awarded for scanning QR codes at historical monuments"}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Feed List */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-white/5 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {t("community.reviewBoard") || "Traveler Experience Board"} ({filteredPosts.length})
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder={t("searchPlaceholder") || "Search reviews or locations..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
            {filteredPosts.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">No community posts found. Share your experience!</p>
            ) : (
              filteredPosts.map((post) => {
                const userIdStr = user?.id || user?._id;
                const postUserIdStr = post.user?._id || post.user;
                const isAuthor = user && post.user && (postUserIdStr === userIdStr);
                const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';

                return (
                  <div key={post._id} className="glass border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4 hover:border-brand-500/10 transition-all">
                    
                    {/* Title & Ratings */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">{post.title}</h4>
                          {(isAuthor || isAdmin) && (
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              {isAuthor && (
                                <button 
                                  onClick={() => handleStartEdit(post)} 
                                  title="Edit review"
                                  className="p-1 text-slate-450 hover:text-brand-500 dark:text-slate-650 dark:hover:text-brand-400 transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeletePost(post._id)} 
                                title="Delete review"
                                className="p-1 text-slate-450 hover:text-red-500 dark:text-slate-655 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-550 dark:text-slate-400 flex items-center gap-1 mt-0.5 flex-wrap">
                          <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                          <span className="truncate">{post.location}</span>
                          <span className="opacity-40">●</span>
                          <span>By: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{post.user?.name || 'Explorer'}</strong></span>
                          {post.createdAt && (
                            <>
                              <span className="opacity-40">●</span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(post.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      {/* Star scores */}
                      <div className="space-y-1 text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Safety</span>
                          <div className="flex">{renderStars(post.safetyRating)}</div>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Experience</span>
                          <div className="flex">{renderStars(post.experienceRating || 5)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Content body */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{post.content}</p>

                    {/* Liked & Comments metrics */}
                    <div className="flex items-center gap-4 border-y border-slate-200 dark:border-white/5 py-3 text-[10px] font-bold text-slate-550 dark:text-slate-400">
                      <button onClick={() => likePost(post._id)} className="flex items-center gap-1.5 hover:text-danger-550 dark:hover:text-danger-500 transition-colors">
                        <Heart className="w-4 h-4 text-red-500 dark:text-danger-500 fill-danger-500/10" />
                        <span>{post.likes || 0} Likes</span>
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-brand-500" />
                        <span>{post.comments?.length || 0} Comments</span>
                      </span>
                    </div>

                    {/* Existing comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl p-3.5 max-h-[150px] overflow-y-auto">
                        {post.comments.map((comment, index) => (
                          <div key={index} className="text-[10px] leading-relaxed border-b border-slate-200 dark:border-white/5 last:border-0 pb-1.5 last:pb-0">
                            <p className="font-bold text-slate-805 dark:text-slate-300">{comment.userName || 'Explorer'}:</p>
                            <p className="text-slate-600 dark:text-slate-400">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment submit form */}
                    <form onSubmit={(e) => handleCommentSubmit(post._id, e)} className="flex gap-2.5">
                      <input
                        type="text"
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                        placeholder="Add helpful reply..."
                        className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:border-brand-500 focus:outline-none rounded-xl px-3.5 py-2 text-[10px] text-slate-800 dark:text-slate-200 font-semibold"
                      />
                      <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-xl flex items-center justify-center transition-all shadow-md">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Community;
