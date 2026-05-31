import React, { useState } from 'react';
import { Youtube, Instagram, Play } from 'lucide-react';

const VideoInput = ({ onSubmit, disabled }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [errors, setErrors] = useState({ youtube: '', instagram: '' });

  // Regex patterns mapping
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p)\/[\w\-]+\/?.*$/;

  const handleYoutubeChange = (e) => {
    const val = e.target.value;
    setYoutubeUrl(val);
    if (val && !youtubeRegex.test(val.trim())) {
      setErrors((prev) => ({ ...prev, youtube: 'Please enter a valid YouTube video URL.' }));
    } else {
      setErrors((prev) => ({ ...prev, youtube: '' }));
    }
  };

  const handleInstagramChange = (e) => {
    const val = e.target.value;
    setInstagramUrl(val);
    if (val && !instagramRegex.test(val.trim())) {
      setErrors((prev) => ({ ...prev, instagram: 'Please enter a valid Instagram Reel or Post URL.' }));
    } else {
      setErrors((prev) => ({ ...prev, instagram: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ytTrimmed = youtubeUrl.trim();
    const igTrimmed = instagramUrl.trim();

    let valid = true;
    const newErrors = { youtube: '', instagram: '' };

    if (!ytTrimmed) {
      newErrors.youtube = 'YouTube URL is required.';
      valid = false;
    } else if (!youtubeRegex.test(ytTrimmed)) {
      newErrors.youtube = 'Invalid YouTube URL format.';
      valid = false;
    }

    if (!igTrimmed) {
      newErrors.instagram = 'Instagram URL is required.';
      valid = false;
    } else if (!instagramRegex.test(igTrimmed)) {
      newErrors.instagram = 'Invalid Instagram URL format.';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      onSubmit(ytTrimmed, igTrimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl border border-border/85 bg-card/40 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          Enter Video Links
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide one YouTube video URL and one Instagram Reel/Post URL to begin.
        </p>
      </div>

      <div className="space-y-5">
        {/* YouTube input */}
        <div className="space-y-2">
          <label htmlFor="youtube-url" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-500 shrink-0" />
            <span>YouTube URL</span>
          </label>
          <div className="relative">
            <input
              id="youtube-url"
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={youtubeUrl}
              onChange={handleYoutubeChange}
              disabled={disabled}
              className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground transition-all duration-200 outline-none focus:ring-2 ${
                errors.youtube
                  ? 'border-destructive focus:ring-destructive/30'
                  : 'border-input focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
          {errors.youtube && (
            <p className="text-xs font-medium text-destructive mt-1 animate-pulse">
              {errors.youtube}
            </p>
          )}
        </div>

        {/* Instagram input */}
        <div className="space-y-2">
          <label htmlFor="instagram-url" className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Instagram className="h-4 w-4 text-purple-500 shrink-0" />
            <span>Instagram Reel / Post URL</span>
          </label>
          <div className="relative">
            <input
              id="instagram-url"
              type="text"
              placeholder="e.g. https://www.instagram.com/reel/C8Fxg-tN9z8/"
              value={instagramUrl}
              onChange={handleInstagramChange}
              disabled={disabled}
              className={`w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm text-foreground transition-all duration-200 outline-none focus:ring-2 ${
                errors.instagram
                  ? 'border-destructive focus:ring-destructive/30'
                  : 'border-input focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
          </div>
          {errors.instagram && (
            <p className="text-xs font-medium text-destructive mt-1 animate-pulse">
              {errors.instagram}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled || !!errors.youtube || !!errors.instagram}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/10 hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Play className="h-4 w-4 shrink-0 fill-current" />
        <span>Analyze & Compare Videos</span>
      </button>
    </form>
  );
};

export default VideoInput;
