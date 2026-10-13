import React, { useState, useRef } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSongStore } from '../../store/useSongStore';
import { api } from '../../api/client';
import { X, UploadCloud, FileMusic, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MidiImportModal: React.FC = () => {
  const { midiImportModalOpen, setMidiImportModalOpen } = useSettingsStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { fetchSongs, setSong } = useSongStore();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!midiImportModalOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.mid') && !selected.name.toLowerCase().endsWith('.midi')) {
        setErrorMsg('Please select a valid .mid or .midi file.');
        setFile(null);
        return;
      }
      setFile(selected);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const importedSong = await api.importMidi(file);
      setSuccessMsg(`Successfully imported "${importedSong.title}" (${importedSong.notes.length} notes)!`);
      await fetchSongs();
      // Auto select the new song
      setSong(importedSong, 'practice');
      setTimeout(() => {
        setMidiImportModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse MIDI file. Ensure it contains playable notes.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="w-full max-w-md bg-studio-surface border border-studio-borderHighlight rounded-2xl p-6 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={() => setMidiImportModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="mb-5">
            <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <FileMusic className="w-5 h-5 text-gold-400" />
              <span>Import Custom MIDI</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Upload any standard .mid file. The melody will be isolated, mapped for seamless interactive learning with full octave flexibility, and saved to your private library.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 text-center mb-4">
              <p className="text-xs text-amber-200 mb-3">
                Cloud saving and MIDI import require an account. Sign in to store your custom songs.
              </p>
              <button
                onClick={() => {
                  setMidiImportModalOpen(false);
                  openAuthModal('login');
                }}
                className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-black font-semibold text-xs rounded-lg shadow-gold-glow"
              >
                Sign In or Register
              </button>
            </div>
          ) : (
            <>
              {/* Drop / Select Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
                  file
                    ? 'border-gold-500/60 bg-gold-500/5'
                    : 'border-neutral-700 hover:border-gold-500/40 bg-black/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mid,.midi"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <UploadCloud className="w-8 h-8 text-gold-400 mx-auto mb-2" />
                {file ? (
                  <div>
                    <span className="text-xs font-mono font-semibold text-gold-200 block truncate">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      {(file.size / 1024).toFixed(1)} KB — Click to change file
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-medium text-gray-200 block">
                      Click to choose a .mid or .midi file
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-1">
                      Max file size: 5MB
                    </span>
                  </div>
                )}
              </div>

              {/* Status alerts */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-2 text-xs text-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMidiImportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  disabled={!file || isUploading}
                  onClick={handleUpload}
                  className={`flex-1 py-2.5 rounded-xl text-black font-semibold text-xs shadow-gold-glow flex items-center justify-center gap-1.5 transition-all ${
                    !file || isUploading
                      ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                      : 'bg-gold-500 hover:bg-gold-400 active:scale-95'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing & Mapping...</span>
                    </>
                  ) : (
                    <span>Import Song</span>
                  )}
                </button>
              </div>
            </>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
