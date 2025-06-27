import React, { useRef, useEffect, useState } from "react";

interface CertificateDownloadProps {
  name: string;
  show: boolean;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 900;
const TEXT_X = 630;
const TEXT_Y = 600;

const CertificateDownload: React.FC<CertificateDownloadProps> = ({ name, show }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  // Load custom font
  useEffect(() => {
    const font = new FontFace("IVFFont", "url(/fonts/ivffont.ttf)");
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      setFontLoaded(true);
    });
  }, []);

  // Draw certificate when font and bg are loaded
  useEffect(() => {
    if (!fontLoaded || !bgLoaded || !show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bg = new window.Image();
    bg.src = "/ivf blood donation.png";
    bg.onload = function () {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.font = "48px IVFFont, Arial, sans-serif";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      ctx.fillText(name, TEXT_X, TEXT_Y);
    };
  }, [fontLoaded, bgLoaded, name, show]);

  // Preload background image
  useEffect(() => {
    const bg = new window.Image();
    bg.src = "/ivf blood donation.png";
    bg.onload = () => setBgLoaded(true);
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!show) return null;

  return (
    <div className="text-center mt-8">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ border: "1px solid #ccc", borderRadius: 8, maxWidth: "100%" }} />
      <br />
      <button onClick={handleDownload} className="mt-4 px-6 py-2 bg-ivf-red text-white rounded font-semibold hover:bg-ivf-red/90">Download Certificate</button>
    </div>
  );
};

export default CertificateDownload;
