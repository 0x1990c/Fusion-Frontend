import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from "react-redux";
import { addCustomerCategory, getCustomerCategories, deleteCustomerCategories, updateCustomerCategory } from "../../services/clients";
import { setCategories } from "../../store/categorySlice";
import { MdOutlineEdit, MdCheck, MdCancel } from "react-icons/md";
import toast from "react-hot-toast";

export const Dropdown = ({ onCategorySelect, onSelect, error, selectedValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editableCategory, setEditableCategory] = useState(-1);
  const [newCategory, setNewCategory] = useState("");
  const [updateCategory, setUpdateCategory] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(selectedValue || []);
  const [selectedCategoryName, setCategoryName] = useState("");
  const categories = useSelector((state) => state.category.categories);
  const dispatch = useDispatch();

  // Update local state when prop changes
  useEffect(() => {
    setSelectedCategories(selectedValue || []);
  }, [selectedValue]);

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleCheckboxChange = (categoryId, categoryName) => {
    const newSelectedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newSelectedCategories);
    
    // Update parent state
    onCategorySelect(newSelectedCategories);
    
    if (newSelectedCategories.length > 0) {
      onSelect?.(newSelectedCategories);
    }

    setCategoryName(categoryName)
  };

  const handleSelectAll = () => {
    const allCategoryIds = categories.map(category => category.id);
    const newSelectedCategories = selectedCategories.length === categories.length ? [] : allCategoryIds;
    
    setSelectedCategories(newSelectedCategories);
    
    // Update parent state
    onCategorySelect(newSelectedCategories);

    if (newSelectedCategories.length > 0) {
      onSelect?.(newSelectedCategories);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      try {
        // Call the service to add the category
        const response = await addCustomerCategory({ name: newCategory.trim() });
        
        if (response) {
          //None same category
          if(response.success == "true"){
            toast.success(response.message);
            let categories = await getCustomerCategories();
            dispatch(setCategories(categories))
            setNewCategory("");
            setShowAddInput(false);
          }else{
            //Category already exists
            toast.error(response.message);
          }
          
        }
      } catch (error) {
        console.error("Failed to add category:", error);
      }
    }
  };

  const handleDeleteCategory = async (e) => {
    e.preventDefault();
    if(selectedCategories.length < 1){
      //selected categoies are empty
      toast.error("You have to select the category to delete.");
    }else{
      try {
        // Call the service to add the category
        const response = await deleteCustomerCategories(selectedCategories);    
        if (response) {
          //Success to delete categories
          if(response.success == "true"){
            toast.success(response.message);
            setSelectedCategories([]);
            let categories = await getCustomerCategories();
            dispatch(setCategories(categories))
          }else{
            //Failure to delete categories
            toast.error(response.message);
          }
        }
      } catch (error) {
        console.error("Failed to add category:", error);
      }
    }
    
  };

  const handleConfirmSelection = () => {
    setIsOpen(false);
  };

  const handleEditClick = (categoryId) => {
    setEditableCategory(categoryId);
  };

  const handleUpdateCategory = async (categoryId) => {
    //update the category name
    if (updateCategory.trim()) {
      try {
        // Call the service to add the category
        const response = await updateCustomerCategory({ name: updateCategory.trim(), categoryId: categoryId });
        
        if (response) {
          //None same category
          if(response.success == "true"){
            toast.success(response.message);
            let categories = await getCustomerCategories();
            dispatch(setCategories(categories))
            setUpdateCategory("");
            setEditableCategory(-1);
          }else{
            //Category already exists
            toast.error(response.message);
          }
        }
      } catch (error) {
        console.error("Failed to add category:", error);
      }
    }
  };

  const cancelUpdateCategory = () => {
    //cancel to update the category name
    setEditableCategory(-1);
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
        onClick={toggleDropdown}
        className={`bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2 text-center inline-flex items-center justify-between w-[220px] ${
          error ? 'border border-red-500' : ''
        }`}
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
                checked={selectedCategories.length === categories.length}
                onChange={handleSelectAll}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="block text-gray-700 font-medium">
                Select All
              </span>
            </li>
            {categories.map((category) => (
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
                {/* <span className="block text-gray-600">
                  {category.name}
                </span> */}

                <input
                  type="text"
                  className="flex-1 border rounded cursor-pointer"
                  placeholder={category.name}
                  value={editableCategory == category.id ? updateCategory : category.name}
                  onChange={(e) => setUpdateCategory(e.target.value)}
                  readOnly={editableCategory == category.id ? false : true}
                  style={{ 
                    border: editableCategory == category.id ? '1px solid #000' : 'none',
                    backgroundColor: 'transparent', 
                    outline: 'none'
                  }}
                />
                {editableCategory == category.id ? 
                  <>
                    <MdCheck className="text-green-500 cursor-pointer" onClick={() => handleUpdateCategory(category.id)}/>
                    <MdCancel className="text-red-500 cursor-pointer" onClick={() => cancelUpdateCategory()}/>
                  </>
                   :
                  <MdOutlineEdit
                      className="text-3xl text-black cursor-pointer hover:bg-black/20 rounded-full p-1 transition-colors"
                      onClick={() => handleEditClick(category.id)}
                  /> 
                }
              </li>
            ))}
          </ul>

          <div className="p-3 border-t">
            {!showAddInput ? (
              <button 
                onClick={() => setShowAddInput(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded w-full"
              >
                Add
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-1 border rounded"
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button 
                  onClick={handleAddCategory}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            <button 
                onClick={handleDeleteCategory}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded w-full"
            >
              Delete
            </button>
          </div>

          <button 
            onClick={handleConfirmSelection}
            className="bg-green-500 hover:bg-green-600 text-white text-center w-full py-2 text-lg font-medium transition-colors"
          >
            Close ({selectedCategories.length})
          </button>
        </div>
      )}
    </div>
  );
};
