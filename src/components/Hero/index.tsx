"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Hls from "hls.js";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const videoSrc =
  "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";
const posterSrc =
  "https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
    }
  }, []);

  return (
    <section
      id="home"
      className="relative w-full min-h-screen overflow-hidden"
      style={{ backgroundColor: "#000000", color: "white" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.6 }}
        muted
        loop
        playsInline
        poster={posterSrc}
      />

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Decorative Gradients */}
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          top: "-20%",
          left: "20%",
          width: 600,
          height: 600,
          background: "rgba(30, 58, 138, 0.2)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          bottom: "-10%",
          right: "20%",
          width: 500,
          height: 500,
          background: "rgba(49, 46, 129, 0.2)",
          filter: "blur(120px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mt-20 flex flex-col items-center text-center mx-auto max-w-5xl px-4 min-h-screen justify-center space-y-12">
        {/* Pre-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl lg:text-[48px] leading-[1.1] text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Diagnóstico inteligente de innovación
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl sm:text-8xl lg:text-[136px] font-semibold leading-[0.9] tracking-tighter bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text text-transparent"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          Evalúa tu TRL
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg sm:text-[20px] leading-[1.65] text-white max-w-xl"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          Herramienta integral para evaluar el nivel de madurez tecnológica y
          comercial de tu propuesta de innovación. Analiza 7 dimensiones clave y
          obtén un diagnóstico completo.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 items-center"
        >
          {/* Primary Button */}
          <Link
            href="#calculator"
            className="group flex items-center gap-3 pl-6 pr-2 py-2 rounded-full bg-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105"
          >
            <span
              className="font-medium text-lg"
              style={{
                fontFamily: "'Instrument Sans', sans-serif",
                color: "#0a0400",
              }}
            >
              Comenzar Diagnóstico
            </span>
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3054ff] group-hover:bg-[#2040e0] transition-colors">
              <ArrowRight className="w-5 h-5 text-white" />
            </span>
          </Link>

          {/* Secondary Button */}
          <Link
            href="/contact"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg text-white/70 hover:text-white backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
          >
            <span>Contacto</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
