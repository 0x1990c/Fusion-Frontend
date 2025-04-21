import React, { useState } from "react";
import { useSelector } from "react-redux";

export const Dropdown = ({ onCategorySelect, onSelect, selectedValue}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(selectedValue || []);
  const categories = useSelector((state) => state.category.categories);
  const [selectedCategoryName, setCategoryName] = useState("");

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleCheckboxChange = (categoryId, categoryName) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelectedCategories);
    
    // Update parent state immediately
    onCategorySelect(newSelectedCategories);

    // Clear error if at least one category is selected
    if (newSelectedCategories.length > 0) {
      onSelect?.(newSelectedCategories);
    }

    setCategoryName(categoryName);
  };

  const handleSelectAll = () => {
    const allCategoryIds = categories.map(category => category.id);
    const newSelectedCategories = selectedCategories.length === categories.length ? [] : allCategoryIds;
    
    setSelectedCategories(newSelectedCategories);
    
    // Update parent state immediately
    onCategorySelect(newSelectedCategories);
    
    // Clear error if at least one category is selected
    if (newSelectedCategories.length > 0) {
      onSelect?.(newSelectedCategories);
    }
  };

  const handleConfirmSelection = () => {
    setIsOpen(false);
  };

  const getButtonText = () => {
    if (selectedCategories.length === 0) return "Select Categories";
    if (selectedCategories.length === 1) {
      return `Selected: ${selectedCategoryName}`;
    }
    return `${selectedCategories.length} categories selected`;
  };

  return (
    <div className="relative inline-block">
      <button
        id="dropdownDefaultButton"
        onClick={toggleDropdown}
        className={`bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2 text-center inline-flex items-center justify-between w-[220px]`}
      >
        <span className="truncate">
          {getButtonText()}
        </span>
        <svg
          className={`w-2.5 h-2.5 ms-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-sm shadow-sm w-[300px] mt-1">
          <ul className="max-h-[200px] overflow-y-auto">
            <li 
              className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-all border-b"
              onClick={handleSelectAll}
            >
              <input 
                type="checkbox" 
                checked={selectedCategories.length === categories?.length}
                onChange={handleSelectAll}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="block text-gray-700 font-medium">
                Select All
              </span>
            </li>
            {categories?.map((category, index) => (
              <li 
                key={category.id}
                className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-all"
                onClick={() => handleCheckboxChange(category.id, category.name)}
              >
                <input 
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCheckboxChange(category.id, category.name)}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="block text-gray-600">
                  {category.name}
                </span>
              </li>
            ))}
          </ul>

          <button 
            onClick={handleConfirmSelection}
            className='bg-green-500 hover:bg-green-600 text-white text-center w-full py-2 text-lg font-medium transition-colors'
          >
            Close ({selectedCategories.length})
          </button>
        </div>
      )}
    </div>
  );
};
