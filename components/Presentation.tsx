import React, { useState } from 'react';
import { Person } from '../types';

interface PresentationProps {
  people: (Person & { caption: string })[];
  onReset: () => void;
}

const Presentation: React.FC<PresentationProps> = ({ people, onReset }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const person = people[currentIndex];
  const isGuessState = !isRevealed;

  const handleNext = () => {
    if (currentIndex < people.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsRevealed(false);
    }
  };

  const handleReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
    }
  };

  if (!person) {
    return (
        <div className="text-center">
            <p>No presentation data available.</p>
            <button onClick={onReset} className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-full">
                Start Over
            </button>
        </div>
    );
  }

  return (
    <div 
      className={`w-full h-screen flex flex-col items-center justify-center p-4 transition-all duration-700 ease-in-out ${isGuessState ? 'cursor-pointer' : ''}`} 
      onClick={handleReveal}
    >
      <button 
        onClick={onReset} 
        className="absolute top-4 left-4 bg-slate-800/70 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-full z-30 transition-colors"
        aria-label="Start Over"
      >
        &larr; Start Over
      </button>

      <div className="absolute top-4 right-4 bg-slate-800/70 text-white font-bold py-2 px-4 rounded-full z-30">
        {currentIndex + 1} / {people.length}
      </div>

      {currentIndex > 0 && (
        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/50 hover:bg-slate-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold z-30" aria-label="Previous Slide">
            &#8249;
        </button>
      )}
       {currentIndex < people.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/50 hover:bg-slate-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold z-30" aria-label="Next Slide">
            &#8250;
        </button>
      )}


      <div className="text-center mb-6 md:mb-12 transition-opacity duration-1000" style={{ opacity: isGuessState ? 1 : 0, height: isGuessState ? 'auto' : 0 }}>
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
          Guess Who?
        </h1>
      </div>

      <div className={`grid gap-4 md:gap-8 items-center justify-center transition-all duration-1000 ease-in-out ${isGuessState ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 max-w-5xl'}`}>
        <div className={`relative transition-all duration-1000 ease-in-out transform ${isGuessState ? 'scale-100 translate-y-0' : 'scale-100 -translate-y-4'}`}>
          <img src={person.childhoodPhotoPreview} alt="Childhood" className="rounded-2xl shadow-2xl max-h-[60vh] object-contain" />
           <p className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-slate-300 text-lg font-semibold transition-opacity duration-1000 ${isGuessState ? 'opacity-0' : 'opacity-100 delay-500'}`}>
             Then
           </p>
        </div>
        <div className={`relative transition-all duration-1000 ease-in-out transform ${isGuessState ? 'opacity-0 scale-50 -z-10 translate-y-4' : 'opacity-100 scale-100 z-0 -translate-y-4'}`}>
           <img src={person.currentPhotoPreview} alt="Current" className="rounded-2xl shadow-2xl max-h-[60vh] object-contain" />
            <p className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-slate-300 text-lg font-semibold transition-opacity duration-1000 ${isGuessState ? 'opacity-0' : 'opacity-100 delay-500'}`}>
             Now
           </p>
        </div>
      </div>
      
      <div className={`mt-12 md:mt-16 text-center max-w-3xl transition-all duration-1000 ease-in-out transform ${isGuessState ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 delay-500'}`}>
        <p className="text-xl md:text-3xl font-medium text-slate-200 italic leading-relaxed">
          "{person.caption}"
        </p>
      </div>

       <div className={`absolute bottom-6 text-center text-slate-500 transition-opacity duration-1000 ${isGuessState ? 'opacity-100' : 'opacity-0'}`}>
        Click anywhere to reveal
      </div>
    </div>
  );
};

export default Presentation;
