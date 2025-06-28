
import React, { useRef, useEffect, useState } from "react";

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
    bg.src = "/ivf blood donation.png";
    bg.onload = function () {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Set font properties
      ctx.font = "bold 48px IVFFont, Arial, sans-serif";
      ctx.fillStyle = "#1a365d"; // Dark blue color
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Position the name in the center-lower part of the certificate
      // Adjust these coordinates based on your certificate template
      const textX = CANVAS_WIDTH / 2; // Center horizontally
      const textY = CANVAS_HEIGHT * 0.65; // About 65% down from top
      
      ctx.fillText(name, textX, textY);
      
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
    bg.src = "/ivf blood donation.png";
    bg.onload = () => setBgLoaded(true);
    bg.onerror = () => {
      console.error('Failed to load certificate background');
      setBgLoaded(true); // Still allow the component to work
    };
  }, []);

  const handleDownload = (format: 'png' | 'jpg' = 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas || !imageReady) return;
    
    let dataURL;
    if (format === 'jpg') {
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
        
        dataURL = tempCanvas.toDataURL('image/jpeg', 0.95);
      } else {
        dataURL = canvas.toDataURL('image/png');
      }
    } else {
      dataURL = canvas.toDataURL('image/png');
    }
    
    const link = document.createElement("a");
    link.download = `blood-donation-certificate.${format}`;
    link.href = dataURL;
    link.click();
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
      
      <div className="flex gap-3 justify-center flex-wrap">
        <button 
          onClick={() => handleDownload('jpg')} 
          disabled={!imageReady}
          className="px-6 py-3 bg-ivf-red text-white rounded-lg font-semibold hover:bg-ivf-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          Download Certificate (JPG)
        </button>
        <button 
          onClick={() => handleDownload('png')} 
          disabled={!imageReady}
          className="px-6 py-3 bg-ivf-navy text-white rounded-lg font-semibold hover:bg-ivf-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          Download Certificate (PNG)
        </button>
      </div>
      
      {!imageReady && (
        <p className="text-sm text-gray-500 mt-2">
          Generating certificate...
        </p>
      )}
    </div>
  );
};

export default CertificateDownload;
