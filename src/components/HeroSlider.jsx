import { useState, useEffect } from "react";
import banners from "../data/banners";

function HeroSlider() {
  const [current, setCurrent] = useState(0);


  useEffect(() => {

    const interval = setInterval(() => {
      setCurrent((prev) => {
        const next =
          prev === banners.length - 1 ? 0 : prev + 1;

        return next;
      });
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [banners]);

  useEffect(() => {
  }, [current]);

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 mt-4 sm:mt-6">
      <div className="max-w-7xl mx-auto">
        <div className="overflow-hidden rounded-lg sm:rounded-2xl shadow-md md:shadow-lg">
          <img
            src={banners[current]}
            alt={`Banner ${current + 1}`}
            className="w-full h-48 sm:h-64 md:h-80 lg:h-[450px] object-cover transition-opacity duration-500"
          />
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => {      
                setCurrent(index);
              }}
              className={`h-2 sm:h-3 w-2 sm:w-3 rounded-full transition-all ${
                current === index
                  ? "bg-blue-600 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroSlider;