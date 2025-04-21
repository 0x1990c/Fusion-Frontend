import { useState } from "react";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types';
import { sendOptinMessages } from "../../services/phone";
export const Dropdown = ({ onStatusSelect, selectedStatuses }) => {
  const [isOpen, setIsOpen] = useState(false);

  const phones = useSelector(state => state.phone.data)
  const optinStatuses = [
    { id: 'Pending', name: 'Pending' },
    { id: 'Success', name: 'Success' },
    { id: 'Refused', name: 'Refused' },
    
  ];

  const toggleDropdown = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleCheckboxChange = (statusId) => {
    if (selectedStatuses.includes(statusId)) {
      onStatusSelect(selectedStatuses.filter(id => id !== statusId));
    } else {
      onStatusSelect([...selectedStatuses, statusId]);
    }
  };

  const handleApplySelection = () => {
    setIsOpen(false);
  };

  const handleSendOptinMessages = async () => {
    const hasValidStatus = selectedStatuses.some(status => 
      status === 'Pending' || status === 'Refused'
    );
    if (hasValidStatus) {
      // TODO: Implement send optin messages logic
      const pending_phones = phones.filter(phone => selectedStatuses.includes(phone.optin_status));
      console.log('phones: ', pending_phones)

      console.log(pending_phones); 

      let res = await sendOptinMessages(pending_phones)
      console.log('res: ', res)
      
    }
  };

  const handleSelectAll = () => {
    if (selectedStatuses.length === optinStatuses.length) {
      onStatusSelect([]);
    } else {
      onStatusSelect(optinStatuses.map(status => status.id));
    }
  };

  const getButtonText = () => {
    if (selectedStatuses.length === 0) return "Select Status";
    if (selectedStatuses.length === 1) return `Selected: ${selectedStatuses[0]}`;
    return `${selectedStatuses.length} statuses selected`;
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none font-medium rounded-lg px-5 py-2 text-center inline-flex items-center justify-between w-[220px]"
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
          <div className="px-4 py-2 border-b">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={selectedStatuses.length === optinStatuses.length}
                onChange={handleSelectAll}
                className="form-checkbox h-4 w-4"
              />
              <span className="text-gray-700 font-medium">Select All</span>
            </label>
          </div>

          <ul className="max-h-[200px] overflow-y-auto">
            {optinStatuses.map((status) => (
              <li 
                key={status.id}
                className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition-all"
                onClick={() => handleCheckboxChange(status.id)}
              >
                <input 
                  type="checkbox"
                  checked={selectedStatuses.includes(status.id)}
                  onChange={() => handleCheckboxChange(status.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="form-checkbox h-4 w-4"
                />
                <span className="block text-gray-600">
                  {status.name}
                </span>
              </li>
            ))}
          </ul>

          {selectedStatuses.some(status => status === 'Pending' || status === 'Refused') && (
            <div className="p-3 border-t">
              <button 
                onClick={handleSendOptinMessages}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded w-full"
              >
                Send Optin Messages
              </button>
            </div>
          )}

          <button 
            onClick={handleApplySelection}
            className="bg-green-500 hover:bg-green-600 text-white text-center w-full py-2 text-lg font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  onStatusSelect: PropTypes.func.isRequired,
  selectedStatuses: PropTypes.arrayOf(PropTypes.string).isRequired
};
