
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { INTRO_STYLES } from '../constants';
import { getIcon } from './BauhausComponents';
import { IntroStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: IntroStyle;
  onSelect: (style: IntroStyle) => void;
  onCustomize: () => void;
}

const StyleButton: React.FC<{ style: IntroStyle; isSelected: boolean; onClick: () => void; }> = ({ 
  style, isSelected, onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 text-left border-b border-bauhaus-green/20 transition-all
        ${isSelected ? 'bg-bauhaus-green text-black shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]' : 'hover:bg-bauhaus-green/10 text-bauhaus-green'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border ${isSelected ? 'border-black' : 'border-bauhaus-green'}`}>
          {getIcon(style.icon, "w-4 h-4")}
        </div>
        <div className="min-w-0">
          <div className="font-bold uppercase text-[10px] tracking-tighter truncate">{style.name}</div>
        </div>
      </div>
    </button>
  );
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, onCustomize }) => {
  return (
    <div className="flex flex-col h-full bg-black">
      {INTRO_STYLES.map((style) => (
        <StyleButton 
          key={style.id}
          style={style}
          isSelected={selectedStyle.id === style.id}
          onClick={() => onSelect(style)}
        />
      ))}
      <button
        onClick={onCustomize}
        className={`
          w-full p-4 text-left border-b border-bauhaus-green transition-all
          ${selectedStyle.id === 'custom' ? 'bg-bauhaus-yellow text-black' : 'hover:bg-bauhaus-green/10 text-bauhaus-green'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border ${selectedStyle.id === 'custom' ? 'border-black' : 'border-bauhaus-green'}`}>
            {getIcon('plus', "w-4 h-4")}
          </div>
          <div className="font-bold uppercase text-[10px] tracking-tighter">INIT_CUSTOM_MODE</div>
        </div>
      </button>
    </div>
  );
};
