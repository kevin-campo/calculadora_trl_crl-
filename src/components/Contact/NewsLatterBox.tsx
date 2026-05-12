
const NewsLatterBox = () => {
  return (
    <div
      className="shadow-three dark:bg-gray-dark relative z-10 rounded-xs bg-white p-8 sm:p-11 lg:p-8 xl:p-11"
      data-wow-delay=".2s"
    >
      <h3 className="mb-4 text-2xl font-bold text-black dark:text-white">
        Suscríbete al Boletín
      </h3>
      <p className="border-body-color border-b border-opacity-25 pb-4 text-base font-medium text-body-color dark:border-white dark:border-opacity-25">
        Recibe las últimas actualizaciones sobre TRL y CRL directamente en tu bandeja de entrada.
      </p>
      <div>
        <input
          type="text"
          name="name"
          placeholder="Tu nombre"
          className="border-stroke dark:text-body-color-dark dark:shadow-two mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Tu email"
          className="border-stroke dark:text-body-color-dark dark:shadow-two mb-4 w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-hidden focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
        />
        <input
          type="submit"
          value="Suscribirse"
          className="shadow-submit dark:shadow-submit-dark bg-primary mb-5 flex w-full cursor-pointer items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90"
        />
        <p className="text-center text-base font-medium text-body-color">
          No enviamos spam. Siéntete libre de darte de baja en cualquier momento.
        </p>
      </div>
    </div>
  );
};

export default NewsLatterBox;
