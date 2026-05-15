"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Hls from "hls.js";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

const videoSrc =
  "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";
const posterSrc =
  "https://image.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g/thumbnail.jpg?time=0";

const Breadcrumb = ({
  pageName,
  description,
}: {
  pageName: string;
  description: string;
}) => {
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
      className="relative z-10 w-full overflow-hidden pt-36 pb-20 lg:pt-[180px] lg:pb-28"
      style={{ backgroundColor: "#0A0F2D", color: "white" }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-[100vh] object-cover object-top"
        style={{ opacity: 0.5 }}
        muted
        loop
        playsInline
        autoPlay
        poster={posterSrc}
      />

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F2D]/50 to-[#0A0F2D] z-0"></div>

      {/* Decorative Gradients */}
      <div
        className="absolute rounded-full mix-blend-screen pointer-events-none"
        style={{
          top: "-30%",
          left: "10%",
          width: 500,
          height: 500,
          background: "rgba(30, 58, 138, 0.25)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute rounded-full mix-blend-screen pointer-events-none"
        style={{
          bottom: "-20%",
          right: "15%",
          width: 400,
          height: 400,
          background: "rgba(49, 46, 129, 0.25)",
          filter: "blur(120px)",
        }}
      />

      {/* Content */}
      <div className="container relative z-10">
        {/* Breadcrumb Trail */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <ul className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                style={{ fontFamily: "'Instrument Sans', sans-serif" }}
              >
                Diagnosticar
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </li>
            <li
              className="text-sm font-semibold text-[#b4c0ff]"
              style={{ fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {pageName}
            </li>
          </ul>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text text-transparent leading-[1.1]"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {pageName}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="max-w-[600px] text-lg leading-relaxed text-white sm:text-xl"
          style={{ fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {description}
        </motion.p>
      </div>
    </section>
  );
};

export default Breadcrumb;
