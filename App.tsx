import React, { useState, useCallback } from 'react';
import { AppState, Person } from './types';
import { fileToGenerativePart } from './utils/fileUtils';
import { generateCaption } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import Presentation from './components/Presentation';
import { GenerateContentRequest } from '@google/genai';

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [newChildhoodPhoto, setNewChildhoodPhoto] = useState<{ file: File, preview: string } | null>(null);
  const [newCurrentPhoto, setNewCurrentPhoto] = useState<{ file: File, preview: string } | null>(null);

  const [appState, setAppState] = useState<AppState>(AppState.Upload);
  const [generationProgress, setGenerationProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File, type: 'childhood' | 'current') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (type === 'childhood') {
        setNewChildhoodPhoto({ file, preview });
      } else {
        setNewCurrentPhoto({ file, preview });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPerson = () => {
    if (newChildhoodPhoto && newCurrentPhoto) {
      const newPerson: Person = {
        id: `${Date.now()}-${Math.random()}`,
        childhoodPhoto: newChildhoodPhoto.file,
        currentPhoto: newCurrentPhoto.file,
        childhoodPhotoPreview: newChildhoodPhoto.preview,
        currentPhotoPreview: newCurrentPhoto.preview,
      };
      setPeople(prev => [...prev, newPerson]);
      setNewChildhoodPhoto(null);
      setNewCurrentPhoto(null);
    }
  };
  
  const handleDeletePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
  }

  const handleStartPresentation = useCallback(async () => {
    if (people.length === 0) {
      setError('Please add at least one person to the presentation.');
      return;
    }

    setAppState(AppState.Generating);
    setError(null);

    try {
      const updatedPeople: Person[] = [];
      for (let i = 0; i < people.length; i++) {
        const person = people[i];
        setGenerationProgress(`Generating caption ${i + 1} of ${people.length}...`);
        
        if (person.caption) {
           updatedPeople.push(person);
           continue;
        }

        const childhoodPhotoPart = await fileToGenerativePart(person.childhoodPhoto);
        const currentPhotoPart = await fileToGenerativePart(person.currentPhoto);

        const prompt = `
          You are creating a fun 'Guess the Child' game. 
          Here are two photos: one of a person as a child and one of them as an adult. 
          Write a single, short, witty, and charming caption that humorously or sweetly connects the two photos. 
          Keep it to one or two sentences. For example: 'The mischievous glint in those eyes? It's definitely still there!' 
          or 'Some things never change, like that award-winning smile.'
        `;

        const contents: GenerateContentRequest['contents'] = {
          parts: [
            childhoodPhotoPart,
            currentPhotoPart,
            { text: prompt },
          ],
        };

        const caption = await generateCaption(contents);
        updatedPeople.push({ ...person, caption });
      }
      
      setPeople(updatedPeople);
      setAppState(AppState.Presenting);
    } catch (err) {
      console.error(err);
      setError('Failed to generate captions. Please check the API key and try again.');
      setAppState(AppState.Upload);
    } finally {
        setGenerationProgress('');
    }
  }, [people]);
  
  const handleReset = () => {
    setPeople([]);
    setNewChildhoodPhoto(null);
    setNewCurrentPhoto(null);
    setAppState(AppState.Upload);
    setGenerationProgress('');
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.Generating:
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-cyan-300">Working our AI magic... ✨</h2>
            <p className="text-slate-400 mt-2">{generationProgress || 'Crafting the perfect witty captions!'}</p>
          </div>
        );
      case AppState.Presenting:
        return (
          <Presentation
            people={people.filter(p => p.caption) as (Person & {caption: string})[]}
            onReset={handleReset}
          />
        );
      case AppState.Upload:
      default:
        return (
          <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                Guess The Child
              </h1>
              <p className="text-slate-300 mt-2 text-lg">Create a fun AI-powered slideshow for your friends or colleagues!</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 md:p-8 mb-8">
                <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Add Person to Slideshow</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <ImageUploader
                    id="childhood-photo"
                    label="Childhood Photo"
                    description="The adorable 'then' picture"
                    previewUrl={newChildhoodPhoto?.preview ?? null}
                    onFileSelect={(file) => handleFileSelect(file, 'childhood')}
                />
                <ImageUploader
                    id="current-photo"
                    label="Current Photo"
                    description="The amazing 'now' picture"
                    previewUrl={newCurrentPhoto?.preview ?? null}
                    onFileSelect={(file) => handleFileSelect(file, 'current')}
                />
                </div>
                 <div className="text-center">
                    <button
                        onClick={handleAddPerson}
                        disabled={!newChildhoodPhoto || !newCurrentPhoto}
                        className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/40 transform hover:scale-105"
                    >
                        Add Person
                    </button>
                </div>
            </div>

            {people.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-100 text-center mb-6">Presentation Slides ({people.length})</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {people.map((person, index) => (
                            <div key={person.id} className="relative group aspect-square">
                                <img src={person.childhoodPhotoPreview} alt={`Person ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                                     <button onClick={() => handleDeletePerson(person.id)} className="text-white bg-red-600/80 hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center font-extrabold text-xl">&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="text-center mt-4">
              <button
                onClick={handleStartPresentation}
                disabled={people.length === 0}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-10 rounded-full text-lg transition-all duration-300 ease-in-out shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:scale-105"
              >
                {`Generate & Start (${people.length} Slide${people.length !== 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-slate-900">
      {renderContent()}
    </main>
  );
};

export default App;
