"use client"

import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { 
  Download, 
  FileSpreadsheet, 
  Settings, 
  Calendar, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  DollarSign, 
  ShoppingCart, 
  X, 
  AlertCircle, 
  Gavel, 
  Search,
  FileText, 
  Pencil, 
  Plus} from "lucide-react"

import DateInterval from "../components/mainpage/DateInterval"
import { loadingOff, loadingOn } from '../store/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { getCases, getCounties, getCourts, getLastQueryDate, alertCourtsToAdmin } from '../services/main';
import { getUser } from '../services/auth';
import { checkout} from '../services/stripe';

import headermark from "../../src/assets/fusion-icon.svg";
import UserProfile from "../components/mainpage/UserProfile"

export const MainPage = () => {

  const [selectedFilter, setSelectedFilter] = useState("Court")
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showGetCases, setShowGetCases] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [showMailMergeOptions, setShowMailMergeOptions] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [showLogPanel, setShowLogPanel] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDateIntervalModalOpen, setIsDateIntervalModalOpen] = useState(false)
  const [courts, setCourts] = useState([]);
  const [caseTypes, setCaseTypes] = useState([]);
  const [counties, setCounties] = useState([]);
  const [settingCounties, setSettingCounties] = useState([]);
  const [settingCourts, setSettingCourts] = useState([]);
  const [filterText, setFilterText] = useState("")
  const [selectedCases, setSelectedCases] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState(2);
  const [saveFolder, setSaveFolder] = useState('');
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Criminal Letter' },
    { id: 2, name: 'Envelop' },
  ]);
  const [exclusionType, setExclusionType] = useState('Case Type');
  const [input, setInput] = useState('');
  const [items, setItems] = useState(['WE']);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const today = new Date();
  const formattedDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;

  const [lastQueryDate, setLastQueryDate] = useState(formattedDate);
  const [durationDate, setDurationDate] = useState(null);

  const dispatch = useDispatch()
  const totalCases = caseTypes.reduce((sum, court) => sum + court.count, 0)
  const navigate = useNavigate()
  // const tabs = ['Mail Merge', 'Mail Merge Exclusions', 'Billing'];
  const tabs = ['Billing'];
  const MAX_SELECTIONS = 3

  useEffect( () => {

    const fetchQueryDate = async () => {
      const queryDate = await getLastQueryDate();
      setLastQueryDate(queryDate.query_date);
    };

    fetchQueryDate(); // Call the async function

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGetCases = () => {
    setIsDateIntervalModalOpen(true);
  }

  //mail merge
  const handleMailMerge = () => {

    if(durationDate == null){
      alert("You have to download the data first.");
    }else{
      navigate('/mailmerge', {state: {durationDate}});
    }
  }

  //settings
  const handleSettings = () => {
    dispatch(loadingOn());
    fetchCourts();
    setShowGetCases(false)
    setShowExportOptions(false)
    setShowMailMergeOptions(false)
    setShowLogPanel(false)
    setShowDeleteConfirm(false)
  }

  const handleLog = () => {
    setShowLogPanel(!showLogPanel)
    setShowGetCases(false)
    setShowExportOptions(false)
    setShowMailMergeOptions(false)
    setShowSettingsPanel(false)
    setShowDeleteConfirm(false)
  }

  const handleDeleteData = () => {
    setShowDeleteConfirm(!showDeleteConfirm)
    setShowGetCases(false)
    setShowExportOptions(false)
    setShowMailMergeOptions(false)
    setShowSettingsPanel(false)
    setShowLogPanel(false)
  }

  //get cases
  const handleDateInterval = (fromDate, toDate) => {
    setIsDateIntervalModalOpen(false)
    dispatch(loadingOn());
    fetchData(fromDate, toDate);
  }

  const fetchCourts = async () => {
    const countyData = await getCourts();
    setSettingCourts(countyData.courts);
    setShowSettingsPanel(!showSettingsPanel)
    dispatch(loadingOff());
  }

  const fetchData = async (fromDate, toDate) => {

    const data = {
      fromDate: fromDate,
      toDate: toDate
  }

  setDurationDate(data);
  // setLastQueryDate
  const casesData = await getCases(data);
    organizeCases(casesData.cases);
    dispatch(loadingOff());
  };

  const organizeCases = (casesData) => {

    if (!Array.isArray(casesData)) {
      console.error("Expected casesData to be an array.");
      return {
        caseTypes: [],
        cities: [],
        courts: []
      };
    }

    const caseTypeCount = {};
    const cityCount = {};
    const courtCount = {};

    casesData.forEach(({ CaseType, DefendantAddressCity, Court }) => {
      caseTypeCount[CaseType] = (caseTypeCount[CaseType] || 0) + 1;
      cityCount[DefendantAddressCity] = (cityCount[DefendantAddressCity] || 0) + 1;
      courtCount[Court] = (courtCount[Court] || 0) + 1;
    });

    const caseTypes = Object.entries(caseTypeCount).map(([name, count]) => ({ name, count }));
    const cities = Object.entries(cityCount).map(([name, count]) => ({ name, count }));
    const courts = Object.entries(courtCount).map(([name, count]) => ({ name, count }));

    setCourts(courts);
    setCaseTypes(caseTypes);
    setCounties(cities);
  }

  // const organizeCounties = (countyData) => {

  //   if (!Array.isArray(countyData)) {
  //     console.error("Expected countyData to be an array.");
  //     return {
  //       counties: [],
  //     };
  //   }

  //   const countyCount = {};
  //     countyData.forEach(({ Court }) => {
  //     countyCount[Court] = (countyCount[Court] || 0) + 1;
  //   });

  //   const counties = Object.entries(countyCount).map(([name, count]) => ({ name, count }));
  //   setSettingCounties(counties);
  // }

  const priceMap = {
    1: "price_1RCBQBAZfjTlvHBo6huhKX6C",
    2: "price_1RMCV1AZfjTlvHBoTLt6xaNz",
    3: "price_1RMCVMAZfjTlvHBoQOmFRg2X",
    4: "price_1RCBOlAZfjTlvHBo7dhKtU1k"
  }

  const handleSubscription = async () => {

    if(selectedCases.length < 1) return;
    setShowSettingsPanel(false)
    setIsLoading(true)
    const user = await getUser();
    
    const data = {
        email: user.username,
        // plan_id: "price_1RCBOlAZfjTlvHBo7dhKtU1k"
        plan_id: priceMap[selectedCases.length]
    }

    try {
        const checkout_session_url = await checkout(data);
        setIsLoading(false)
        if(checkout_session_url)
        {
            setShowSettingsPanel(false)
            window.location.href = checkout_session_url;
        }
        else{
            console.error("No Url found in the response");
        }
    } catch (error) {
        console.error("Error during checkout:", error);
        throw error;
    }
  };

  const toggleCaseSelection = async(countyIdentifier, courtName) => {

    if (selectedCases.includes(courtName)) {
      // Always allow deselection
      setSelectedCases(selectedCases.filter((name) => name !== courtName))
    } else {
      // Only allow selection if under the limit
      if (selectedCases.length < MAX_SELECTIONS) {
        setSelectedCases([...selectedCases, courtName])
      }
      
      const user = await getUser();
      const countyName = courtName.split(" ")[0];
      const data = {
        county: countyName,
        court: courtName,
        user:user.username
      }

      await alertCourtsToAdmin(data);
    }
  }

  const confirmDelete = () => {
    setNotification(null)
    setShowDeleteConfirm(false)
    setIsLoading(true)
    // Simulate deletion process
    setTimeout(() => {
      setIsLoading(false)
      setCourts([]);
      setCaseTypes([]);
      setCounties([]);
      setNotification({ type: "success", message: "Data successfully deleted" })
    }, 1500)
  }

  const filteredCaseTypes = settingCourts.filter(
    (court) =>
      court.courts.toLowerCase().includes(filterText.toLowerCase())
  );

  const actionButtons = [
    { name: "Get Cases", icon: <Download className="w-12 h-12 text-white" />, handler: handleGetCases },
    { name: "Mail Merge", icon: <FileText className="w-12 h-12 text-white" />, handler: handleMailMerge },
    { name: "Settings", icon: <Settings className="w-12 h-12 text-white" />, handler: handleSettings },
    { name: "Delete Data", icon: <Trash2 className="w-12 h-12 text-white" />, handler: handleDeleteData },
  ]

  // Calculate price based on number of selected items ($100 per item)
  const calculatePrice = () => {
    if(selectedCases.length == 3){
      return 500;
    }else{
      return selectedCases.length * 200
    }
  }

  const handleDelete = (id) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const handleEdit = (id) => {
    const name = prompt('Edit template name:');
    if (name) {
      setTemplates(
        templates.map(t => (t.id === id ? { ...t, name } : t))
      );
    }
  };

  const handleAddTemplate = () => {
    const name = prompt('New template name:');
    if (name) {
      setTemplates([...templates, { id: Date.now(), name }]);
    }
  };

  const handleAddItem = () => {
    if (input.trim()) {
      setItems([...items, input.trim()]);
      setInput('');
    }
  };

  const handleRemove = () => {
    if (selectedIndex !== null) {
      setItems(items.filter((_, index) => index !== selectedIndex));
      setSelectedIndex(null);
    }
  };

  const handleFolderSelect = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();

      console.error('Folder Name:', directoryHandle.name);
      const fullPath = await getFullPath(directoryHandle);
      setSaveFolder(fullPath);
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const getFullPath = async (directoryHandle) => {
    let pathParts = [];

    // Collect the names of the directories
    while (directoryHandle) {
      pathParts.unshift(directoryHandle.name); // Add the current directory name to the beginning of the array
      // Attempt to get the parent directory
      try {
        directoryHandle = await directoryHandle.getParent();
      } catch {
        directoryHandle = null; // No parent found
      }
    }

    return pathParts.join('/'); // Join parts to form a simulated full path
  };

  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    .search-input {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 30px;
      border-radius: 4px;
      width: 100%;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .search-input:focus {
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  `
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="flex justify-start flex-row pt-1 pb-1 box-border items-center">
        <div className="w-1/6 flex flex-row items-center">
          <img src={headermark} alt="" width={40} height={40}/>
          {!isMobile && <span style={styles.title}>Fusion Menu</span>}
        </div>
        <div className="w-5/6">
          <div className="flex flex-row justify-end items-center gap-4">
            <UserProfile></UserProfile>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-24 md:grid-cols-2">
        {/* Left Panel - Action Buttons */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-16">
            {actionButtons.slice(0, 2).map((button, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-blue-600 p-6 w-[80%] flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-blue-700 transition-colors"
                  onClick={button.handler}
                >
                  {button.icon}
                  <div className="mt-2 text-center text-white text-2xl">{button.name}</div>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-gray-300" />

          <div className="grid grid-cols-2 gap-16">
            {actionButtons.slice(2).map((button, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-blue-600 p-6 w-[80%] flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-blue-700 transition-colors"
                  onClick={button.handler}
                >
                  {button.icon}
                  <div className="mt-2 text-center text-white text-2xl">{button.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Court Listing */}
        <div className="border border-gray-300 bg-white p-4">
          <div className="flex justify-center space-x-8 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="Case Type"
                checked={selectedFilter === "Case Type"}
                onChange={() => setSelectedFilter("Case Type")}
                className="mr-2 cursor-pointer"
              />
              <span className="text-blue-600">Case Type</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="Court"
                checked={selectedFilter === "Court"}
                onChange={() => setSelectedFilter("Court")}
                className="mr-2 cursor-pointer"
              />
              <span className="text-blue-600">Court</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="filter"
                value="County"
                checked={selectedFilter === "County"}
                onChange={() => setSelectedFilter("County")}
                className="mr-2 cursor-pointer"
              />
              <span className="text-blue-600">County</span>
            </label>
          </div>

          {selectedFilter == "Case Type" && (
            <>
              <div className="text-center mb-4 font-bold">[{totalCases} CASES]</div>
              <div className="h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {caseTypes.map((court, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-gray-400 text-center w-12 py-1">{court.count}</div>
                      <div className="ml-2 truncate">{court.name}</div>
                    </div>
                  ))}
                </div>
              </div>            
            </>
          )}

          {selectedFilter == "Court" && (
            <>
              <div className="text-center mb-4 font-bold">[{totalCases} CASES]</div>
              <div className="h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {courts.map((court, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-gray-400 text-center w-12 py-1">{court.count}</div>
                      <div className="ml-2 truncate">{court.name}</div>
                    </div>
                  ))}
                </div>
              </div>            
            </>
          )}

          {selectedFilter == "County" && (
            <>
              <div className="text-center mb-4 font-bold">[{totalCases} CASES]</div>
              <div className="h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {counties.map((court, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-gray-400 text-center w-12 py-1">{court.count}</div>
                      <div className="ml-2 truncate">{court.name}</div>
                    </div>
                  ))}
                </div>
              </div>            
            </>
          )}

        </div>
      </div>
      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-center">Processing...</p>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${notification.type === "success" ? "bg-green-100 border-l-4 border-green-500" : "bg-red-100 border-l-4 border-red-500"}`}
        >
          <div className="flex items-center">
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${notification.type === "success" ? "text-green-800" : "text-red-800"}`}
              >
                {notification.message}
              </p>
            </div>
            <button className="ml-4 text-gray-400 hover:text-gray-500" onClick={() => setNotification(null)}>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Export Options Panel */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Export Options</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Export to Excel</button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Export to CSV</button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Export to PDF</button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowExportOptions(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showGetCases && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Date Interval</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Export to Excel</button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Export to CSV</button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Export to PDF</button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowGetCases(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mail Merge Options Panel */}
      {showMailMergeOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Mail Merge Options</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Create Letters</button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Create Labels</button>
              <button className="w-full text-left p-2 hover:bg-gray-100 rounded">Create Envelopes</button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowMailMergeOptions(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >    
          <div style={styles.tabs}>
            <ul style={styles.tabList}>
              {tabs.map((tab, index) => (
                <li
                  key={index}
                  style={{
                    ...styles.tab,
                    ...(activeTab === index ? styles.activeTab : {}),
                  }}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </li>
              ))}
            </ul>
            <div style={styles.tabContent}>
              <style>{scrollbarStyles}</style>
              {activeTab === 0 && 
              <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md ">
                <label className="block font-semibold mb-1 text-blue-700">Mail Merge Save Folder</label>
                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    className="border rounded-l px-3 py-1 w-full"
                    value={saveFolder}
                    onChange={(e) => setSaveFolder(e.target.value)}
                  />
                  <button className="bg-gray-200 border rounded-r px-3 py-1" onClick={handleFolderSelect}>...</button>
                </div>
                <label className="block font-semibold mb-2 text-blue-700">Mail Merge Templates</label>
                <div className="h-[350px] w-full overflow-y-auto custom-scrollbar border rounded p-2 bg-gray-50 overflow-hidden">
                  {templates.map((template) => (
                    <div key={template.id} className="flex justify-between items-center border-b last:border-none py-2">
                      <span>{template.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(template.id)} className="text-blue-600">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(template.id)} className="text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddTemplate}
                    className="flex items-center gap-1 text-sm text-blue-700 mt-2"
                  >
                    <Plus size={16} /> Add Template
                  </button>
                </div>
                <div className='flex justify-center'>
                  <button className="mt-6 w-1/3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 m-4">
                    Save
                  </button>
                  <button className="mt-6 w-1/3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 m-4" onClick={() => setShowSettingsPanel(false)}>
                    Close
                  </button>
                </div>
              </div>}
              {activeTab === 1 && 
              <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
                <fieldset className="border p-4 mb-4">
                  <legend className="text-blue-700 font-semibold">Exclusion</legend>
                  {['Case Type', 'Party Name', 'Offense Description', 'Case Number'].map((type) => (
                    <div key={type} className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={type}
                        name="exclusion"
                        value={type}
                        checked={exclusionType === type}
                        onChange={(e) => setExclusionType(e.target.value)}
                        className="mr-2"
                      />
                      <label htmlFor={type} className="text-blue-700">{type}</label>
                    </div>
                  ))}
                </fieldset>
                <div className="flex items-center mb-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="border px-2 py-1 rounded-l w-full"
                  />
                  <button onClick={handleAddItem} className="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600">+</button>
                </div>
                <div className="flex">
                  <select
                    size="5"
                    className="w-full border p-2"
                    value={selectedIndex}
                    onChange={(e) => setSelectedIndex(Number(e.target.value))}
                  >
                    {items.map((item, index) => (
                      <option key={index} value={index}>{item}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleRemove}
                    className="ml-2 bg-blue-500 text-white px-3 py-1 h-fit hover:bg-blue-600"
                  >
                    -
                  </button>
                </div>
                <div className='flex justify-center'>
                  <button className="mt-6 w-1/3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 m-4">
                    Save
                  </button>
                  <button className="mt-6 w-1/3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 m-4" onClick={() => setShowSettingsPanel(false)}>
                    Close
                  </button>
                </div>
              </div>}
              {activeTab === 2 && 
              <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg">
                <div className="flex items-center gap-2 text-lg font-medium mb-4">
                  <FileText className="h-5 w-5" />
                  <span>{selectedCases.length} selected</span>
                  {selectedCases.length >= MAX_SELECTIONS && (
                    <span className="text-sm text-amber-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Maximum selections reached
                    </span>
                  )}
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left panel with scrollable case types */}
                  <div className="w-full md:w-[400px] bg-blue-700 text-white rounded-md overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                        <input
                          type="text"
                          placeholder="Filter case types..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          className="search-input pl-10"
                        />
                      </div>
                    </div>
                    {/* Custom scroll area with custom scrollbar styles */}
                    <div className="h-[400px] w-full overflow-y-auto custom-scrollbar">
                      <div className="p-6">
                        {filteredCaseTypes.length > 0 ? (
                          filteredCaseTypes.map((caseType) => (
                            <div key={caseType.identifier} className="flex items-center mb-3">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <Gavel className="h-4 w-4 mr-2" />
                                  <span className="ml-2">{caseType.courts}</span>
                                </div>
                              </div>
                              <div className="cursor-pointer" onClick={() => toggleCaseSelection(caseType.identifier, caseType.courts)}>
                                {selectedCases.includes(caseType.courts) ? (
                                  <CheckCircle2 className="h-5 w-5 text-white" />
                                ) : (
                                  <Circle className={`h-5 w-5 ${selectedCases.length >= MAX_SELECTIONS ? "opacity-50" : ""}`} />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-white/70">No case types match your filter</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Right panel with price and buttons */}
                  <div className="flex-1 flex flex-col justify-center items-center gap-6">
                    <div className="text-3xl font-medium flex items-center">
                      <DollarSign className="h-8 w-8" />
                      {calculatePrice()}
                    </div>
                    <div className="flex gap-4">
                      {/* Custom button instead of imported component */}
                      <button
                        className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-2 rounded-md text-lg flex items-center gap-2 transition-colors"
                        onClick={() => handleSubscription()}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Purchase
                      </button>
                      <button
                        className="border border-blue-600 text-blue-600 hover:blue-600 px-8 py-2 rounded-md text-lg flex items-center gap-2 transition-colors"
                        onClick={() => setShowSettingsPanel(false)}
                      >
                        <X className="h-5 w-5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>}
            </div>
          </div>
        </div>
      )}

      {/* Log Panel */}
      {showLogPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h3 className="text-lg font-bold mb-4">Activity Log</h3>
            <div className="h-64 overflow-y-auto border rounded p-2">
              <div className="border-b py-2">
                <div className="font-medium">Data Export</div>
                <div className="text-sm text-gray-500">Today, 10:23 AM</div>
              </div>
              <div className="border-b py-2">
                <div className="font-medium">Case Retrieval</div>
                <div className="text-sm text-gray-500">Today, 9:45 AM</div>
              </div>
              <div className="border-b py-2">
                <div className="font-medium">Settings Updated</div>
                <div className="text-sm text-gray-500">Yesterday, 3:12 PM</div>
              </div>
              <div className="border-b py-2">
                <div className="font-medium">Mail Merge</div>
                <div className="text-sm text-gray-500">Yesterday, 11:30 AM</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowLogPanel(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete all data? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isDateIntervalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <DateInterval
            onClose={() => setIsDateIntervalModalOpen(false)}
            onSubmit={(dateRange) => handleDateInterval(dateRange.fromDate, dateRange.toDate)}
            lastQueryDate={(lastQueryDate)}
          />
        </div> )}
    </div>
  )
}

const styles = {
  title: {
    color: "#04004e",
    fontSize: "23px",
    fontFamily: "Lexend Deca",
    fontWeight: 700,
    lineHeight: "30px",
    marginLeft: "30px"
  },
  bell : {
    width : 35,
    height : 35
  },
  tabs: {
    width: '800px',
    height: '600px',
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
  tabList: {
    display: 'flex',
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  tab: {
    flex: 1,
    padding: '15px',
    cursor: 'pointer',
    background: '#f5f5f5',
    border: 'none',
    borderRight: '1px solid #ccc',
    fontSize: '16px',
    fontWeight: 500,
    color: '#333',
  },
  activeTab: {
    background: '#fff',
    color: '#0077b6',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: '20px',
    borderTop: '1px solid #ccc',
    background: '#fff',
    fontSize: '16px',
    lineHeight: '24px',
  },
};




