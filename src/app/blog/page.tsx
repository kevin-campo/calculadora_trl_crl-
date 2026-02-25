"use client";
import SingleBlog from "@/components/Blog/SingleBlog";
import blogData from "@/components/Blog/blogData";
import Breadcrumb from "@/components/Common/Breadcrumb";


const Blog = () => {
  return (
    <>
      <Breadcrumb
        pageName="Noticias y Novedades"
        description="Explora nuestras últimas publicaciones sobre innovación, tecnología y madurez comercial."
      />

      <section className="pt-[120px] pb-[120px]">
        <div className="container relative">
          <div className="group relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => {
                const el = document.getElementById("blog-slider");
                el.scrollBy({ left: -400, behavior: "smooth" });
              }}
              className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 p-3 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100 lg:flex dark:bg-dark/80 dark:hover:bg-dark"
              aria-label="Anterior"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("blog-slider");
                el.scrollBy({ left: 400, behavior: "smooth" });
              }}
              className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 p-3 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:opacity-100 lg:flex dark:bg-dark/80 dark:hover:bg-dark"
              aria-label="Siguiente"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Slider Container */}
            <div
              id="blog-slider"
              className="no-scrollbar -mx-4 flex scroll-smooth overflow-x-auto px-4 pb-12 snap-x snap-mandatory"
            >
              {blogData.map((blog) => (
                <div
                  key={blog.id}
                  className="w-[85%] min-w-[300px] shrink-0 px-4 md:w-1/2 lg:w-1/3 xl:w-1/3 snap-center transition-transform duration-300 hover:scale-[1.02] flex"
                >
                  <SingleBlog blog={blog} />
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
    </>
  );
};

export default Blog;
