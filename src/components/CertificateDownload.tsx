
import React, { useRef, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { url } from "inspector";

interface CertificateDownloadProps {
  name: string;
  show: boolean;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 900;

const CertificateDownload: React.FC<CertificateDownloadProps> = ({ name, show }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  // Load custom font
  useEffect(() => {
    const font = new FontFace("IVFFont", "url(/fonts/ivffont.ttf)");
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      setFontLoaded(true);
    }).catch(() => {
      // Fallback if custom font fails to load
      setFontLoaded(true);
    });
  }, []);

  // Draw certificate when font and bg are loaded
  useEffect(() => {
    if (!fontLoaded || !bgLoaded || !show || !name.trim()) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const bg = new Image();
    bg.src = "https://i.ibb.co/Zz1Cks34/ivf-blood-donation-2.png"; // Background image URL
    bg.onload = function () {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Set font properties
      ctx.font = "bold 32px IVFFont, Arial, sans-serif";
      ctx.fillStyle = "#1a365d"; // Dark blue color
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Capitalize the first letter of the name
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      
      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Position the name in the center-lower part of the certificate
      const textX = CANVAS_WIDTH * 0.40; // Center horizontally (45% of width)
      const textY = CANVAS_HEIGHT * 0.43; // About 43% down from top
      
      ctx.fillText(displayName, textX, textY);
      
      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      setImageReady(true);
    };
  }, [fontLoaded, bgLoaded, name, show]);

  // Preload background image
  useEffect(() => {
    const bg = new Image();
    bg.src = "https://i.ibb.co/Zz1Cks34/ivf-blood-donation-2.png";
    bg.onload = () => setBgLoaded(true);
    bg.onerror = () => {
      console.error('Failed to load certificate background');
      setBgLoaded(true); // Still allow the component to work
    };
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageReady) return;
    
    // Create a white background for JPG
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Fill with white background
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw the original canvas on top
      tempCtx.drawImage(canvas, 0, 0);
      
      const dataURL = tempCanvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement("a");
      link.download = `blood-donation-certificate.jpg`;
      link.href = dataURL;
      link.click();
    }
  };

  if (!show) return null;

  return (
    <div className="text-center mt-8">
      <div className="mb-4">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          style={{ 
            border: "2px solid #e2e8f0", 
            borderRadius: 12, 
            maxWidth: "100%", 
            height: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }} 
          className="mx-auto"
        />
      </div>
      
      <div className="flex items-center justify-center gap-4 mb-4">
        {imageReady ? (
          <div className="flex items-center text-green-600 font-medium">
            <Check className="h-5 w-5 mr-2" />
            Certificate Generated Successfully
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ivf-red mr-2"></div>
            Generating certificate...
          </div>
        )}
      </div>
      
      <button 
        onClick={handleDownload} 
        disabled={!imageReady}
        className="px-8 py-3 bg-ivf-red text-white rounded-lg font-semibold hover:bg-ivf-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        Download Certificate (JPG)
      </button>
    </div>
  );
};

export default CertificateDownload;
