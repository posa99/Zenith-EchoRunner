
import React, { useState } from 'react';
import { GameSettings, GameTheme, GameDifficulty, CharacterStyle, CameraPOV } from '../types';

interface MainMenuProps {
  onStart: () => void;
  settings: GameSettings;
  onSettingsChange: (s: GameSettings) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, settings, onSettingsChange }) => {
  const [showSettings, setShowSettings] = useState(false);

  const themes = Object.values(GameTheme);
  const difficulties = Object.values(GameDifficulty);
  const styles = Object.values(CharacterStyle);
  const povs = Object.values(CameraPOV);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f0f4f8] p-6 overflow-y-auto">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-cyan-100/50 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-full h-[35vh] bg-white shadow-2xl border-t-4 border-gray-100"></div>
      </div>

      {!showSettings ? (
        <div className="relative text-center z-10 w-full max-w-5xl py-12">
          <div className="mb-8 inline-block bg-[#1a1a1a] text-cyan-400 px-8 py-3 text-xs font-black tracking-[0.8em] uppercase italic animate-pulse shadow-2xl border-l-8 border-cyan-500">
            ZENITH CORE v5.2 // LINK ESTABLISHED
          </div>
          <h1 className="text-8xl md:text-[16rem] font-orbitron font-black tracking-tighter text-[#1a1a1a] leading-[0.75] mb-12 italic drop-shadow-2xl">
            ECH<span className="text-cyan-500">O</span><br/>RUN
          </h1>
          
          <div className="flex flex-col gap-6 max-w-md mx-auto">
            <button 
              onClick={onStart}
              className="group relative px-20 py-10 bg-[#1a1a1a] text-white font-orbitron font-black text-4xl transition-all hover:bg-cyan-600 shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:-translate-y-2 active:translate-y-0 border-b-8 border-cyan-800"
            >
              INITIALIZE SYNC
              <div className="absolute -inset-2 border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity scale-105"></div>
            </button>
            
            <button 
              onClick={() => setShowSettings(true)}
              className="px-12 py-6 bg-white border-2 border-gray-100 text-[#1a1a1a] font-orbitron font-bold hover:border-cyan-500 transition-all uppercase tracking-[0.4em] text-sm shadow-xl"
            >
              System Parameters
            </button>
          </div>
          
          <div className="mt-40 flex flex-wrap gap-12 justify-center text-gray-400 text-[10px] font-black uppercase tracking-[0.6em] opacity-60">
            <p className="hover:text-cyan-500 transition-colors cursor-default">Reactive POV System</p>
            <p className="hover:text-pink-500 transition-colors cursor-default">Multi-Stage Progression</p>
            <p className="hover:text-cyan-500 transition-colors cursor-default">Environmental Assets v2</p>
          </div>
        </div>
      ) : (
        <div className="relative bg-white p-8 md:p-14 shadow-[0_60px_120px_rgba(0,0,0,0.15)] w-full max-w-4xl border-t-[16px] border-cyan-500 my-10 rounded-lg">
           <div className="flex justify-between items-center mb-10 border-b-2 border-gray-100 pb-8">
              <h2 className="text-4xl md:text-5xl font-orbitron font-black text-[#1a1a1a] italic tracking-tighter decoration-pink-500 underline underline-offset-[12px]">SYNC CONFIG</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-200 hover:text-pink-600 transition-colors p-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10">
              <div className="space-y-8">
                <div>
                  <label className="text-cyan-600 text-[9px] uppercase tracking-[0.5em] font-black block mb-3">Neural Environment</label>
                  <select 
                    value={settings.theme}
                    onChange={(e) => onSettingsChange({...settings, theme: e.target.value as GameTheme})}
                    className="w-full bg-gray-50 border-b-4 border-gray-100 p-5 font-orbitron font-bold text-base outline-none focus:border-cyan-500 transition-colors appearance-none shadow-sm"
                  >
                    {themes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-cyan-600 text-[9px] uppercase tracking-[0.5em] font-black block mb-3">Sync Difficulty</label>
                  <div className="flex gap-2">
                    {difficulties.map(d => (
                      <button 
                        key={d}
                        onClick={() => onSettingsChange({...settings, difficulty: d})}
                        className={`flex-1 py-4 text-[9px] font-black font-orbitron transition-all rounded-sm ${settings.difficulty === d ? 'bg-cyan-500 text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-cyan-600 text-[9px] uppercase tracking-[0.5em] font-black block mb-3">Interface POV</label>
                  <div className="flex gap-2">
                    {povs.map(p => (
                      <button 
                        key={p}
                        onClick={() => onSettingsChange({...settings, pov: p})}
                        className={`flex-1 py-4 text-[9px] font-black font-orbitron transition-all rounded-sm ${settings.pov === p ? 'bg-black text-white shadow-2xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                      >
                        {p === CameraPOV.FIRST_PERSON ? 'FIRST PERSON' : 'THIRD PERSON'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-cyan-600 text-[9px] uppercase tracking-[0.5em] font-black block mb-3">Character Shell</label>
                  <div className="flex gap-2">
                    {styles.map(s => (
                      <button 
                        key={s}
                        onClick={() => onSettingsChange({...settings, characterStyle: s})}
                        className={`flex-1 py-4 text-[9px] font-black font-orbitron transition-all rounded-sm ${settings.characterStyle === s ? 'bg-pink-600 text-white shadow-2xl' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                      >
                        {s === CharacterStyle.SILHOUETTE ? 'SHADOW' : 'CORE'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-cyan-600 text-[9px] uppercase tracking-[0.5em] font-black">Visual Width (FOV)</label>
                    <span className="text-[#1a1a1a] font-black font-orbitron">{settings.fov}°</span>
                  </div>
                  <input 
                    type="range" min="80" max="130" step="1" 
                    value={settings.fov}
                    onChange={(e) => onSettingsChange({ ...settings, fov: parseInt(e.target.value) })}
                    className="w-full accent-cyan-500 h-3 bg-gray-100 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-cyan-600 text-[9px] uppercase tracking-[0.5em] font-black">Haptic Sensitivity</label>
                    <span className="text-[#1a1a1a] font-black font-orbitron">{(settings.sensitivity * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="4.0" step="0.1" 
                    value={settings.sensitivity}
                    onChange={(e) => onSettingsChange({ ...settings, sensitivity: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500 h-3 bg-gray-100 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-8 border-y border-gray-100">
                   <div>
                      <label className="text-[#1a1a1a] font-orbitron font-black text-xs uppercase tracking-[0.4em]">Touch Interface</label>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Optimized for Mobile Sync</p>
                   </div>
                   <button 
                      onClick={() => onSettingsChange({ ...settings, mobileControls: !settings.mobileControls })}
                      className={`w-20 h-10 rounded-full transition-all duration-500 ${settings.mobileControls ? 'bg-cyan-500 shadow-lg' : 'bg-gray-200'} relative shadow-inner`}
                   >
                      <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all duration-300 shadow-xl ${settings.mobileControls ? 'left-11' : 'left-1'}`}></div>
                   </button>
                </div>
              </div>
           </div>

           <button 
             onClick={() => setShowSettings(false)}
             className="w-full mt-14 py-8 bg-[#1a1a1a] text-white font-black font-orbitron text-2xl transition-all hover:bg-cyan-600 uppercase italic tracking-tighter shadow-3xl hover:scale-[1.01] active:scale-95 rounded-sm border-b-8 border-cyan-900"
           >
             Save System Kernel
           </button>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
