import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://api.escuelajs.co/api/v1/categories")
      .then((res) => res.json())
      .then((data) => {
        const filteredCategories = data
          .filter(
            (category) =>
              category.name &&
              category.image &&
              category.image.startsWith("http")
          )
          .slice(0, 5);

        setCategories(filteredCategories);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 animate-slide-left" style={{ animationFillMode: 'both' }}>
        <div>
          <h2 className="text-3xl font-black tracking-tight">
            <span className="genz-gradient-text genz-text-glow">Shop by Department 🎒</span>
          </h2>
          <p className="text-sm text-slate-400 font-semibold mt-1.5 font-sans">Explore our diverse curated list of products by category. Aesthetic Vibez.</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map((category, idx) => (
          <div
            key={category.id}
            onClick={() => navigate(`/category/${category.id}`)}
            className="animated-border-card category-card-premium group cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 animate-slide-up-dash"
            style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
          >
            <div className="animated-border-card-inner overflow-hidden rounded-3xl h-full flex flex-col">
              {/* Image */}
              <div className="overflow-hidden bg-gray-100 flex-grow">
                <img
                  src={category.image}
                  alt={category.name}
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800";
                  }}
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

            {/* Content */}
            <div className="p-4 text-center">
              <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                {category.name}
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Browse Collection
              </p>

              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-blue-600 font-medium">
                  Explore →
                </span>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Category;