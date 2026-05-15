"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({
  pageName,
  description,
}: {
  pageName: string;
  description: string;
}) => {

  return (
    <section
      className="relative z-10 w-full overflow-hidden pt-36 pb-20 lg:pt-[180px] lg:pb-28"
      style={{ backgroundColor: "#0A0F2D", color: "white" }}
    >
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      
      {/* Deep Overlay */}
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
