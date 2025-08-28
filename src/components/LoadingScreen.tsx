import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, MapPin, Navigation } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { text: "Inicializando AURA...", icon: Sun },
    { text: "Conectando con servicios meteorológicos...", icon: Cloud },
    { text: "Preparando mapas de rutas...", icon: MapPin },
    { text: "Configurando pronósticos...", icon: CloudRain },
    { text: "Calibrando navegación...", icon: Navigation },
    { text: "¡Listo para tu aventura!", icon: Wind }
  ];

  useEffect(() => {
    const duration = 4000; // 4 segundos total
    const stepDuration = duration / steps.length;
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 50));
        return Math.min(newProgress, 100);
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        if (newStep >= steps.length) {
          clearInterval(stepInterval);
          clearInterval(progressInterval);
          
          // Fade out y completar
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
              onComplete();
            }, 500);
          }, 500);
          
          return prev;
        }
        return newStep;
      });
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [onComplete, steps.length]);

  const CurrentIcon = steps[currentStep]?.icon || Sun;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Fondo animado con nubes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-white/10 animate-float">
          <Cloud size={80} />
        </div>
        <div className="absolute top-40 right-20 text-white/10 animate-float-delayed">
          <Cloud size={60} />
        </div>
        <div className="absolute bottom-32 left-1/4 text-white/10 animate-float">
          <Cloud size={100} />
        </div>
        <div className="absolute top-1/4 right-1/3 text-white/10 animate-float-delayed">
          <Cloud size={70} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 text-center px-8 max-w-md w-full">
        {/* Logo AURA */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 mb-4 animate-pulse-slow">
            <span className="text-4xl font-bold text-white">🌤️</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider">
            AURA
          </h1>
          <p className="text-blue-100 text-lg font-medium">
            Pronóstico del Clima en Ruta
          </p>
        </div>

        {/* Icono de paso actual animado */}
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 animate-bounce-gentle">
            <CurrentIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Texto del paso actual */}
        <div className="mb-8 h-6">
          <p className="text-white/90 text-sm font-medium animate-fade-in">
            {steps[currentStep]?.text || "Preparando..."}
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-4 backdrop-blur-sm">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Porcentaje */}
        <p className="text-white/70 text-xs font-medium">
          {Math.round(progress)}%
        </p>

        {/* Puntos decorativos */}
        <div className="flex justify-center space-x-2 mt-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep ? 'bg-yellow-400 shadow-lg' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Efecto de partículas */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
