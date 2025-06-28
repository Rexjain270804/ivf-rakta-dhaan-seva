import React, { useRef, useEffect, useState } from "react";
import { Check } from "lucide-react";

interface CertificateDownloadProps {
  name: string;
  show: boolean;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 900;
const BG_URL = "https://i.ibb.co/Zz1Cks34/ivf-blood-donation-2.png";

const CertificateDownload: React.FC<CertificateDownloadProps> = ({ name, show }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [imageReady, setImageReady] = useState(false);

  // Load custom font
  useEffect(() => {
    const font = new FontFace("IVFFont", "url(/fonts/ivffont.ttf)");
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      setFontLoaded(true);
    }).catch(() => {
      setFontLoaded(true);
    });
  }, []);

  // Preload background image ONCE and store in state
  useEffect(() => {
    const bg = new window.Image();
    bg.crossOrigin = "anonymous";
    bg.src = BG_URL;
    bg.onload = () => setBgImage(bg);
    bg.onerror = () => {
      console.error('Failed to load certificate background');
      setBgImage(null);
    };
  }, []);

  // Draw certificate when font and bg are loaded
  useEffect(() => {
    if (!fontLoaded || !bgImage || !show || !name.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(bgImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = "bold 32px IVFFont, Arial, sans-serif";
    ctx.fillStyle = "#1a365d";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const textX = CANVAS_WIDTH * 0.40;
    const textY = CANVAS_HEIGHT * 0.43;

    ctx.fillText(displayName, textX, textY);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    setImageReady(true);
  }, [fontLoaded, bgImage, name, show]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageReady) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      tempCtx.drawImage(canvas, 0, 0);

      const dataURL = tempCanvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement("a");
      link.download = `blood-donation-certificate.jpg`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
