import React, { useState } from 'react';
import { data } from '../restApi.json';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Extract unique categories from dishes
  const categories = ['All', ...new Set(data[0].dishes.map(dish => dish.category))];
  
  // Filter dishes based on selected category
  const filteredDishes = activeCategory === 'All' 
    ? data[0].dishes 
    : data[0].dishes.filter(dish => dish.category === activeCategory);

  return (
    <section className="py-16 bg-gray-50" id="menu">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Popular Dishes</h2>
          <p className="max-w-2xl mx-auto text-gray-600">
            Explore our chef's special selection of signature dishes crafted with the freshest ingredients
            and innovative cooking techniques that will delight your taste buds.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <div 
              key={dish.id} 
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={dish.image} 
                  alt={dish.title} 
                  className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-blue-600">
                  {dish.category}
                </span>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{dish.title}</h3>
                
                {dish.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dish.description}</p>
                )}
                
                {dish.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">${dish.price}</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Order Now
                    </button>
                  </div>
                )}
                
                {!dish.price && (
                  <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredDishes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No dishes found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;