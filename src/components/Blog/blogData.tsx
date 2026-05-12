import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Entendiendo la escala TRL en proyectos de I+D+i",
    paragraph:
      "Aprende a medir el nivel de madurez técnica de tus innovaciones y cómo avanzar hacia la comercialización.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "Juan Pérez",
      image: "/images/blog/author-03.png",
      designation: "Especialista en Innovación",
    },
    tags: ["TRL", "I+D+i"],
    publishDate: "2024",
    link: "/blog-details",
  },
  {
    id: 2,
    title: "Cómo el CRL puede salvar tu startup del valle de la muerte",
    paragraph:
      "Identifica los riesgos comerciales de tu propuesta antes de que sea demasiado tarde mediante el análisis CRL.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "María García",
      image: "/images/blog/author-02.png",
      designation: "Consultora de Negocios",
    },
    tags: ["CRL", "Emprendimiento"],
    publishDate: "2024",
    link: "/blog-crl-details",
  },
  {
    id: 3,
    title: "Guía paso a paso para realizar un diagnóstico de madurez tecnológica",
    paragraph:
      "Te explicamos cómo utilizar nuestra calculadora para obtener los mejores resultados en tu evaluación.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Luis Rodríguez",
      image: "/images/blog/author-03.png",
      designation: "Ingeniero de Producto",
    },
    tags: ["Guía", "Herramientas"],
    publishDate: "2024",
    link: "/blog-guide-details",
  },
];
export default blogData;
