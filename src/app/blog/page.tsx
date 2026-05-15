"use client";
import SingleBlog from "@/components/Blog/SingleBlog";
import blogData from "@/components/Blog/blogData";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { ChevronLeft, ChevronRight } from "lucide-react";


const Blog = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Breadcrumb
        pageName="Blog y Noticias"
        description="Explora nuestras últimas publicaciones sobre innovación, tecnología y madurez comercial."
      />

      <section className="pb-24 pt-12">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Últimas Publicaciones</h3>
              <p className="text-gray-500 dark:text-gray-400">Mantente al día con las tendencias de TRL y CRL</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const el = document.getElementById("blog-slider");
                  el.scrollBy({ left: -400, behavior: "smooth" });
                }}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("blog-slider");
                  el.scrollBy({ left: 400, behavior: "smooth" });
                }}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer"
                aria-label="Siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              id="blog-slider"
              className="no-scrollbar -mx-4 flex scroll-smooth overflow-x-auto px-4 pb-12 snap-x snap-mandatory"
            >
              {blogData.map((blog) => (
                <div
                  key={blog.id}
                  className="w-[90%] min-w-[320px] shrink-0 px-4 md:w-1/2 lg:w-1/3 snap-center transition-all duration-500"
                >
                  <div className="h-full bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all group">
                    <SingleBlog blog={blog} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style jsx>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      </section>
    </main>
  );
};

export default Blog;
