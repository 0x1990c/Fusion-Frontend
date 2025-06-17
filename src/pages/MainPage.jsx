"use client"

import React, { useEffect, useState, useRef } from 'react'
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
  AlertCircle, 
  Gavel, 
  Search,
  FileText, 
  Pencil, 
  Plus,
  MapPin, 
  Building2, 
  CheckSquare,
  X, 
  Filter, 
  Check, 
  ChevronDown, 
  Save, 
  RefreshCw,
  List,
  Upload, 
  Mail, 
  Eye, 
  File, 
  Edit,
  Loader2  } from "lucide-react"
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from "react-router-dom"











import headermark from "../../src/assets/fusion-icon.svg";
import DateInterval from "../components/mainpage/DateInterval"
import UserProfile from "../components/mainpage/UserProfile"
import { getUser } from '../services/auth';
import { getCases, getIndianaCounties, getCourts, getLastQueryDate, alertCourtsToAdmin, uploadTemplates, getSavedTemplates, getSavedShortcode, getFields, addNewShortcode, removeShortcode, removeSavedTemplate, getPurchasedCourts } from '../services/main';
import { checkout} from '../services/stripe';
import { loadingOff, loadingOn } from '../store/authSlice'










const calculatePayment = (courtCount) => {
  switch (courtCount) {
    case 1:
      return 200
    case 2:
      return 400
    case 3:
      return 500
    default:
      return 0
  }
}

const MAX_COURTS = 3

const purchasedCountiesData1 = [
  {
    identifier: "01",
    name: "Adams County",
    courts: [
      { identifier: "01C01", courts: "Adams Circuit Court" },
      { identifier: "01D01", courts: "Adams Superior Court" },
    ],
  },
  {
    identifier: "02",
    name: "Allen County",
    courts: [
      { identifier: "02C01", courts: "Allen Circuit Court" },
      { identifier: "02D01", courts: "Allen Superior Court 1" },
      { identifier: "02D02", courts: "Allen Superior Court 2" },
      { identifier: "02D03", courts: "Allen Superior Court 3" },
    ],
  },
  {
    identifier: "03",
    name: "Bartholomew County",
    courts: [
      { identifier: "03C01", courts: "Bartholomew Circuit Court" },
      { identifier: "03D01", courts: "Bartholomew Superior Court 1" },
      { identifier: "03D02", courts: "Bartholomew Superior Court 2" },
    ],
  },
  {
    identifier: "04",
    name: "Benton County",
    courts: [{ identifier: "04C01", courts: "Benton Circuit Court" }],
  },
  {
    identifier: "05",
    name: "Blackford County",
    courts: [
      { identifier: "05C01", courts: "Blackford Circuit Court" },
      { identifier: "05D01", courts: "Blackford Superior Court" },
    ],
  },
  {
    identifier: "06",
    name: "Boone County",
    courts: [
      { identifier: "06C01", courts: "Boone Circuit Court" },
      { identifier: "06D01", courts: "Boone Superior Court 1" },
      { identifier: "06D02", courts: "Boone Superior Court 2" },
    ],
  },
]

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
  const [activeTab, setActiveTab] = useState(0);
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

  const [selectedCounty, setSelectedCounty] = useState("")
  const [selectedCourts, setSelectedCourts] = useState([])
  const [availableCourts, setAvailableCourts] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [allSelectedCourts, setAllSelectedCourts] = useState([])

  const [letterTemplates, setLetterTemplates] = useState([])
  const [envelopeTemplates, setEnvelopeTemplates] = useState([])

  const [letterSavedTemplates, setLetterSavedTemplates] = useState([])
  const [envelopeSavedTemplates, setEnvelopeSavedTemplates] = useState([])
  // Currently selected template for preview
  const [selectedLetterTemplate, setSelectedLetterTemplate] = useState(null)
  const [selectedEnvelopeTemplate, setSelectedEnvelopeTemplate] = useState(null)

  // Preview states
  const [letterPreview, setLetterPreview] = useState(null)
  const [envelopePreview, setEnvelopePreview] = useState(null)

  // UI states
  const [dragOver, setDragOver] = useState({ letter: false, envelope: false })
  const [uploadStatus, setUploadStatus] = useState({ letter: null, envelope: null })
  const [previewLoading, setPreviewLoading] = useState({ letter: false, envelope: false })

  const [newPair, setNewPair] = useState({ fieldName: "", shortcode: "" })
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false)
  const [fileldLoading, setFieldLoading] = useState(false)

  const [savedShortCode, setSavedShortCode] = useState([])
  const [fieldList, setFieldList] = useState([])
  
  const [purchasedCountiesData, setPurchasedCountiesData] = useState([])


  // Template variables for replacement
  const [templateVariables, setTemplateVariables] = useState({
    defendant_name: "John Doe",
    case_number: "CV-2024-001",
    court: "Superior Court of California",
    file_date: "2024-06-01",
    appear_by_date: "2024-07-15",
  })

  // Processed content state (after variable replacement)
  const [processedContent, setProcessedContent] = useState({
    letter: null,
    envelope: null,
  })

  const letterInputRef = useRef(null)
  const envelopeInputRef = useRef(null)

  const dispatch = useDispatch()
  const totalCases = caseTypes.reduce((sum, court) => sum + court.count, 0)
  const navigate = useNavigate()
  // const tabs = ['Counties & Courts', 'Billing', 'Letter & Envelope Templates', 'Mail Merge Exclusions'];
  const tabs = ['My Courts', 'Billing', 'Templates', 'Shortcodes'];
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
    fetchCourtsAndCounties();
    fetchSavedTemplates();
    fetchSavedShortcode();
    fetchPurchasedCourts();
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

  const fetchSavedTemplates = async () => {

    const user = await getUser();
    
    const data = {
      username: user.username,
    }

    const response = await getSavedTemplates(data);
    const templates = response.templates;
    setLetterSavedTemplates(templates.filter(t => t.template_type === "letter"));
    setEnvelopeSavedTemplates(templates.filter(t => t.template_type === "envelope"));
  }

  const fetchSavedShortcode = async () => {

    const response = await getSavedShortcode();
    const shortcodes = response.shortcodes;
    setSavedShortCode(shortcodes);

    const responseField = await getFields();
    const fields = responseField.fields;
    setFieldList(fields);
    console.log(fields);
    // setFieldList
  }

  const fetchCourtsAndCounties = async () => {
    const courtData = await getCourts();
    setSettingCourts(courtData.courts);

    const countyData = await getIndianaCounties();
    setSettingCounties(countyData.counties);

    setShowSettingsPanel(!showSettingsPanel)
    dispatch(loadingOff());
  }

  const fetchData = async (fromDate, toDate) => {

    const data = {
      fromDate: fromDate,
      toDate: toDate
    }

    setDurationDate(data);
    const casesData = await getCases(data);
      organizeCases(casesData.cases);
      dispatch(loadingOff());
  };

  const fetchPurchasedCourts = async() => {
    const response = await getPurchasedCourts();
    console.log(response.purchased_courts)
    setPurchasedCountiesData(response.purchased_courts);
  }

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

  const handleProceedPayment = async () =>{

    if(allSelectedCourts.length < 1) return;
    
    setShowSettingsPanel(false)
    setIsLoading(true)
    const user = await getUser();
    
    const data = {
        email: user.username,
        // plan_id: "price_1RCBOlAZfjTlvHBo7dhKtU1k"
        plan_id: priceMap[allSelectedCourts.length],
        selectedCourts: allSelectedCourts
    }

    try {
        const checkout_session_url = await checkout(data);
        setIsLoading(false)

        if(checkout_session_url)
        {
            setShowSettingsPanel(true)
            window.location.href = checkout_session_url;
        }
        else{
            console.error("No Url found in the response");
        }
    } catch (error) {
        console.error("Error during checkout:", error);
        throw error;
    }

  }

  const toggleCaseSelection = async(countyName, courtName) => {

    if (selectedCourts.includes(courtName)) {
      // Always allow deselection
      setSelectedCases(selectedCourts.filter((name) => name !== courtName))
    } else {
     
      const user = await getUser();
      const data = {
        county: countyName,
        court: courtName,
        user:user.username
      }

      console.log(data);
      
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
  const countiesData = {};

  settingCounties.forEach(county => {
    countiesData[county.county] = {
        name: county.county,
        courts: []
    };
  });

  settingCourts.forEach(court => {
    const countyIdentifier = court.identifier.slice(0, 2); // Get the first two characters of identifier
    const countyKey = settingCounties.find(c => c.identifier === countyIdentifier)?.county;

    if (countyKey) {
        countiesData[countyKey].courts.push(court);
    }
  })

  useEffect(() => {
    if (selectedCounty && countiesData[selectedCounty]) {
      setAvailableCourts(countiesData[selectedCounty].courts)
      setSelectedCourts([]) // Reset court selection when county changes
    } else {
      setAvailableCourts([])
      setSelectedCourts([])
    }
  }, [selectedCounty])

  // Update allSelectedCourts when selectedCourts changes
  useEffect(() => {
    if (selectedCounty && selectedCourts.length > 0) {
      const currentCountyName = countiesData[selectedCounty].name
      const currentSelectedCourts = selectedCourts.map((courtId) => {
        const court = availableCourts.find((c) => c.id === courtId)
        return {
          id: courtId,
          courts: court?.courts,
          county: currentCountyName,
          countyId: selectedCounty,
          courtIdentifier: court?.identifier
        }
      })

      // Remove courts from the same county and add new ones
      setAllSelectedCourts((prev) => [
        ...prev.filter((court) => court.countyId !== selectedCounty),
        ...currentSelectedCourts,
      ])
    } else if (selectedCounty) {
      // Remove all courts from current county if none selected
      setAllSelectedCourts((prev) => prev.filter((court) => court.countyId !== selectedCounty))
    }
  }, [selectedCourts, selectedCounty, availableCourts])

  // Handle window resize to recalculate dropdown height
  useEffect(() => {
    const handleResize = () => {
      // Force re-render when window is resized
      if (isDropdownOpen) {
        setIsDropdownOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isDropdownOpen])

  // Handle individual court selection with maximum limit
  const handleCourtToggle = (courtId, selectedCounty, selectedCourt) => {
    
    toggleCaseSelection(selectedCounty, selectedCourt);

    setSelectedCourts((prev) => {
      if (prev.includes(courtId)) {
        // Remove court if already selected
        return prev.filter((id) => id !== courtId)
      } else {
        // Check if we can add more courts (considering total across all counties)
        if (allSelectedCourts.length >= MAX_COURTS) {
          return prev // Don't add if already at maximum
        }
        return [...prev, courtId]
      }
    })
  }

  // Handle select all courts with maximum limit
  const handleSelectAll = () => {
    if (selectedCourts.length === availableCourts.length) {
      setSelectedCourts([]) // Deselect all if all are selected
    } else {
      // Calculate how many courts we can still select
      const remainingSlots = MAX_COURTS - allSelectedCourts.filter((court) => court.countyId !== selectedCounty).length
      const courtsToSelect = availableCourts.slice(0, remainingSlots).map((court) => court.id)
      setSelectedCourts(courtsToSelect)
    }
  }

  // Remove individual court from all selected courts
  const removeCourtFromSelection = (courtId) => {
    setAllSelectedCourts((prev) => prev.filter((court) => court.id !== courtId))
    // Also update current selection if it's from the current county
    if (selectedCourts.includes(courtId)) {
      setSelectedCourts((prev) => prev.filter((id) => id !== courtId))
    }
  }

  // Check if all courts are selected
  const allSelected = availableCourts.length > 0 && selectedCourts.length === availableCourts.length

  // Check if court can be selected (not at maximum limit)
  const canSelectMoreCourts = allSelectedCourts.length < MAX_COURTS

  // Calculate current payment
  const currentPayment = calculatePayment(allSelectedCourts.length)

  const acceptedTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "text/plain", // .txt
  ]

  // Check if file type is accepted
  const isFileTypeAccepted = (file) => {
    return acceptedTypes.includes(file.type)
  }

  // Get file type category
  const getFileCategory = (file) => {
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "docx"
    if (file.type === "text/plain") return "txt"
    return "unknown"
  }

  // Get file extension from name
  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toLowerCase()
  }

  // Extract text from DOCX file using mammoth
  const extractDocxContent = async (file) => {
    try {
      // Import mammoth dynamically
      const mammoth = await import("mammoth")

      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })

      return {
        text: result.value,
        messages: result.messages,
      }
    } catch (error) {
      console.error("Error extracting DOCX content:", error)
      throw new Error("Failed to extract content from DOCX file")
    }
  }

  // Replace template variables in content
  const replaceTemplateVariables = (content) => {
    if (!content) return ""

    let processedContent = content

    // Replace each variable
    Object.entries(templateVariables).forEach(([key, value]) => {
      const placeholder = `[[${key}]]`
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
      processedContent = processedContent.replace(regex, value || placeholder)
    })

    return processedContent
  }

  // Process selected templates with variables
  const processTemplatesWithVariables = () => {
    const newProcessedContent = { letter: null, envelope: null }

    // Process letter template
    if (letterPreview && letterPreview.content) {
      const processedLetterContent = replaceTemplateVariables(letterPreview.content)
      newProcessedContent.letter = {
        ...letterPreview,
        content: processedLetterContent,
        originalContent: letterPreview.content, // Keep original for reset
        isProcessed: true,
      }
    }

    // Process envelope template
    if (envelopePreview && envelopePreview.content) {
      const processedEnvelopeContent = replaceTemplateVariables(envelopePreview.content)
      newProcessedContent.envelope = {
        ...envelopePreview,
        content: processedEnvelopeContent,
        originalContent: envelopePreview.content, // Keep original for reset
        isProcessed: true,
      }
    }

    setProcessedContent(newProcessedContent)
  }

  // Reset processed content to original
  const resetProcessedContent = () => {
    // Reset letter preview to original content
    if (processedContent.letter && processedContent.letter.originalContent) {
      setLetterPreview((prev) => ({
        ...prev,
        content: processedContent.letter.originalContent,
      }))
    }

    // Reset envelope preview to original content
    if (processedContent.envelope && processedContent.envelope.originalContent) {
      setEnvelopePreview((prev) => ({
        ...prev,
        content: processedContent.envelope.originalContent,
      }))
    }

    setProcessedContent({ letter: null, envelope: null })
  }

  // Handle file selection
  const handleFileSelect = (file, type) => {
    
    const fileExtension = getFileExtension(file.name)

    // Check both MIME type and file extension for better validation
    if (!isFileTypeAccepted(file) && !["docx", "txt"].includes(fileExtension)) {
      setUploadStatus((prev) => ({
        ...prev,
        [type]: { success: false, message: "File type not supported. Please upload .docx or .txt files only." },
      }))
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setUploadStatus((prev) => ({
        ...prev,
        [type]: { success: false, message: "File size too large. Please upload files smaller than 10MB." },
      }))
      return
    }

    const templateId = Date.now().toString() // Generate unique ID

    const fileData = {
      id: templateId,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      letterType: type,
      extension: fileExtension,
      category: getFileCategory(file) || fileExtension,
      uploadDate: new Date().toISOString(),
    }

    if (type === "letter") {
      // Add to letter templates array
      setLetterTemplates((prev) => [...prev, fileData])

      // Set as selected template
      setSelectedLetterTemplate(fileData)

      // Generate preview
      generatePreview(file, setLetterPreview, type)

      setUploadStatus((prev) => ({
        ...prev,
        letter: { success: true, message: "Letter template uploaded successfully!" },
      }))
    } else {
      // Add to envelope templates array
      setEnvelopeTemplates((prev) => [...prev, fileData])

      // Set as selected template
      setSelectedEnvelopeTemplate(fileData)

      // Generate preview
      generatePreview(file, setEnvelopePreview, type)

      setUploadStatus((prev) => ({
        ...prev,
        envelope: { success: true, message: "Envelope template uploaded successfully!" },
      }))
    }

    // Clear processed content when new file is uploaded
    setProcessedContent((prev) => ({ ...prev, [type]: null }))

    // Clear status after 3 seconds
    setTimeout(() => {
      setUploadStatus((prev) => ({
        ...prev,
        [type]: null,
      }))
    }, 3000)
  }

  // Generate preview for uploaded file
  const generatePreview = async (file, setPreview, type) => {
    const fileExtension = getFileExtension(file.name)

    // Set loading state
    setPreviewLoading((prev) => ({ ...prev, [type]: true }))

    try {
      if (file.type === "text/plain" || fileExtension === "txt") {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview({
            type: "text",
            content: e.target.result,
            name: file.name,
          })
          setPreviewLoading((prev) => ({ ...prev, [type]: false }))
        }
        reader.readAsText(file)
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileExtension === "docx"
      ) {
        try {
          const docxContent = await extractDocxContent(file)
          setPreview({
            type: "docx",
            content: docxContent.text,
            name: file.name,
            url: URL.createObjectURL(file),
            messages: docxContent.messages,
          })
        } catch (error) {
          setPreview({
            type: "docx-error",
            name: file.name,
            url: URL.createObjectURL(file),
            error: error.message,
          })
        }
        setPreviewLoading((prev) => ({ ...prev, [type]: false }))
      } else {
        setPreview({
          type: "document",
          name: file.name,
        })
        setPreviewLoading((prev) => ({ ...prev, [type]: false }))
      }
    } catch (error) {
      console.error("Error generating preview:", error)
      setPreview({
        type: "error",
        name: file.name,
        error: "Failed to generate preview",
      })
      setPreviewLoading((prev) => ({ ...prev, [type]: false }))
    }
  }

  // Handle template selection
  const handleTemplateSelect = async (template, type) => {
    if (type === "letter") {
      setSelectedLetterTemplate(template)
      setPreviewLoading((prev) => ({ ...prev, letter: true }))
      await generatePreview(template.file, setLetterPreview, "letter")
    } else {
      setSelectedEnvelopeTemplate(template)
      setPreviewLoading((prev) => ({ ...prev, envelope: true }))
      await generatePreview(template.file, setEnvelopePreview, "envelope")
    }

    // Clear processed content when switching templates
    setProcessedContent((prev) => ({ ...prev, [type]: null }))
  }

  // Handle drag and drop
  const handleDragOver = (e, type) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [type]: true }))
  }

  const handleDragLeave = (e, type) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [type]: false }))
  }

  const handleDrop = (e, type) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [type]: false }))

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0], type)
    }
  }

  // Handle file input change
  const handleInputChange = (e, type) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      handleFileSelect(files[0], type)
    }
  }

  // Remove template
  const removeTemplate = (templateId, type) => {
    if (type === "letter") {
      // Check if removing the selected template
      if (selectedLetterTemplate && selectedLetterTemplate.id === templateId) {
        setSelectedLetterTemplate(null)
        setLetterPreview(null)
      }

      // Remove from templates array
      setLetterTemplates((prev) => prev.filter((template) => template.id !== templateId))
    } else {
      // Check if removing the selected template
      if (selectedEnvelopeTemplate && selectedEnvelopeTemplate.id === templateId) {
        setSelectedEnvelopeTemplate(null)
        setEnvelopePreview(null)
      }

      // Remove from templates array
      setEnvelopeTemplates((prev) => prev.filter((template) => template.id !== templateId))
    }

    // Clear processed content if removing selected template
    setProcessedContent((prev) => ({ ...prev, [type]: null }))
  }

  const handleRemoveSavedTemplate = async (templateName, type) => {
    
    setLetterSavedTemplates((prev) => prev.filter((template) => template.origin_name !== templateName))
    const data = {
      origin_name: templateName,
      saved_name: templateName,
      saved_path: '',  
      template_type: type,
      content: '',
      user: ''
    }
    const responseRemove = await removeSavedTemplate(data);

  }
  // Clear all templates
  const clearAllTemplates = (type) => {
    if (type === "letter") {
      setLetterTemplates([])
      setSelectedLetterTemplate(null)
      setLetterPreview(null)
      if (letterInputRef.current) letterInputRef.current.value = ""
    } else {
      setEnvelopeTemplates([])
      setSelectedEnvelopeTemplate(null)
      setEnvelopePreview(null)
      if (envelopeInputRef.current) envelopeInputRef.current.value = ""
    }

    setUploadStatus((prev) => ({ ...prev, [type]: null }))
    setPreviewLoading((prev) => ({ ...prev, [type]: false }))
    setProcessedContent((prev) => ({ ...prev, [type]: null }))
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Get file type display name
  const getFileTypeDisplay = (template) => {
    if (!template) return ""
    if (template.category === "txt" || template.extension === "txt") return "Text Document"
    if (template.category === "docx" || template.extension === "docx") return "Word Document"
    return "Document"
  }

  // Render upload area
  const renderUploadArea = (type, icon) => {
    const isDragOver = dragOver[type]
    const status = uploadStatus[type]
    const templates = type === "letter" ? letterTemplates : envelopeTemplates
    const savedTemplates = type === "letter" ? letterSavedTemplates : envelopeSavedTemplates
    const selectedTemplate = type === "letter" ? selectedLetterTemplate : selectedEnvelopeTemplate

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-medium text-gray-900">
              {type === "letter" ? "Templates" : "Envelope Templates"}
            </h3>
          </div>

          {templates.length > 0 && (
            <button
              onClick={() => clearAllTemplates(type)}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Clear all templates"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </button>
          )}
        </div>

        {savedTemplates.length > 0 && (
          <div className="space-y-2">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedTemplates.map((template) => (
                <div
                  key={savedTemplates.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all border-blue-500 bg-blue-50`}
                >
                  <div className="flex items-center gap-3">
                    <File
                      className={`h-5 w-5 text-blue-600`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{template.origin_name}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveSavedTemplate(template.origin_name, type)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                    title="Remove template"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => handleDragOver(e, type)}
          onDragLeave={(e) => handleDragLeave(e, type)}
          onDrop={(e) => handleDrop(e, type)}
        >
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label
                htmlFor={`${type}-upload`}
                className="cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id={`${type}-upload`}
                  ref={type === "letter" ? letterInputRef : envelopeInputRef}
                  type="file"
                  className="sr-only"
                  accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={(e) => handleInputChange(e, type)}
                />
              </label>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Only .docx and .txt files up to 10MB</p>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              status.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            {status.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span className="text-sm">{status.message}</span>
          </div>
        )}

        {/* Templates List */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <File className="h-4 w-4" />
              {templates.length} {type === "letter" ? "Letter" : "Envelope"} Template{templates.length !== 1 ? "s" : ""}
            </h4>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate && selectedTemplate.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTemplateSelect(template, type)}
                >
                  <div className="flex items-center gap-3">
                    <File
                      className={`h-5 w-5 ${selectedTemplate && selectedTemplate.id === template.id ? "text-blue-600" : "text-gray-400"}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{getFileTypeDisplay(template)}</span>
                        <span>•</span>
                        <span>{formatFileSize(template.size)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeTemplate(template.id, type)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                    title="Remove template"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render preview
  const renderPreview = (preview, template, type) => {
    if (!preview || !template) return null

    const isLoading = previewLoading[type]
    const processed = processedContent[type]

    // Show processed content if available, otherwise show original
    const displayContent = processed ? processed : preview
    const isShowingProcessed = !!processed

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview: {template.name}
            {isShowingProcessed && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Variables Replaced
              </span>
            )}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
          </h4>

          <div className="flex items-center gap-2">
            {/* <button
              onClick={processTemplatesWithVariables}
              disabled={isShowingProcessed}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isShowingProcessed
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
              title="Replace variables"
            >
              <Edit className="h-3 w-3" />
              Replace Variables
            </button> */}

            {isShowingProcessed && (
              <button
                onClick={resetProcessedContent}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-orange-300 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                title="Reset to original"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            )}

            {/* {preview.url && (
              <a
                href={preview.url}
                download={template.name}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="h-3 w-3" />
                Download
              </a>
            )} */}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center bg-gray-50">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-2 text-sm text-gray-600">Loading preview...</p>
            </div>
          ) : (
            <>
              {(displayContent.type === "text" || displayContent.type === "docx") && (
                <div className="p-4 bg-gray-50">
                  <div className="bg-white border border-gray-200 rounded p-4 max-h-96 overflow-y-auto">
                    {displayContent.type === "docx" && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            Word Document Content
                            {isShowingProcessed && " (Variables Replaced)"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div
                      className={`text-sm text-gray-800 leading-relaxed whitespace-pre-wrap ${
                        displayContent.type === "text" ? "font-mono" : ""
                      }`}
                    >
                      {displayContent.content || "No text content found in this document."}
                    </div>
                    {displayContent.messages && displayContent.messages.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Note: Some formatting may not be preserved in this preview.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preview.type === "docx-error" && (
                <div className="p-8 text-center bg-red-50">
                  <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
                  <p className="mt-2 text-sm font-medium text-red-900">Failed to load document content</p>
                  <p className="text-xs text-red-600 mt-1">{preview.error}</p>
                  <p className="text-xs text-gray-500 mt-2">You can still download the file using the button above.</p>
                </div>
              )}

              {preview.type === "error" && (
                <div className="p-8 text-center bg-red-50">
                  <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
                  <p className="mt-2 text-sm text-red-600">Error loading preview</p>
                  <p className="text-xs text-red-500">{preview.error}</p>
                </div>
              )}

              {preview.type === "document" && (
                <div className="p-8 text-center bg-gray-50">
                  <File className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Document preview not available</p>
                  <p className="text-xs text-gray-500">{preview.name}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  const saveAllTemplates = async () => {
    console.log("Letter Templates:", letterTemplates);
    console.log("Envelope Templates:", envelopeTemplates);
  
    const formData = new FormData();
  
    // Append letter templates under a specific key
    for (let i = 0; i < letterTemplates.length; i++) {
      const letterTemplate = letterTemplates[i];
      formData.append("letterFiles", letterTemplate.file);
    }
  
    // Append envelope templates under a different key
    // for (let i = 0; i < envelopeTemplates.length; i++) {
    //   const envelopeTemplate = envelopeTemplates[i];
    //   formData.append("envelopeFiles", envelopeTemplate.file);
    // }
  
    // Get user data and append username
    const user = await getUser();
    formData.append("username", user.username);
    
    try {
      const responseUpload = await uploadTemplates(formData);
      if (responseUpload.success) {
        fetchSavedTemplates();
      } else {
        console.error("Failed to upload templates");
      }
    } catch (error) {
      console.error("Error uploading templates:", error);
    }
  };
  

  const addPair = async () => {


    if (newPair.field && newPair.shortcode) {
      setSavedShortCode([...savedShortCode, { ...newPair, id: Date.now() }])
      setNewPair({ field: "", shortcode: "" })
      setIsFieldDropdownOpen(false)
      const responseUpload = await addNewShortcode(newPair);
      console.log(responseUpload);
    }
  }

  const removePair = async(index, field, shortcode) => {

    const data = {
      field: field,
      shortcode: shortcode
    }
    const responseRemove = await removeShortcode(data);
    console.log(responseRemove);
    setSavedShortCode(savedShortCode.filter((_, i) => i !== index))
  }

  const handleFieldNameSelect = (field) => {
    setNewPair({ ...newPair, field })
    setIsFieldDropdownOpen(false)
  }

  const handleSave = () => {
    // Handle save logic here
    onClose()
  }

  const [purchasedCounty, setPurchasedCounty] = useState("01")

  const currentPurchasedCounty = purchasedCountiesData.find((county) => county.identifier === purchasedCounty)
  const currentPurchasedCourts = currentPurchasedCounty ? currentPurchasedCounty.courts : []

  const handleCountyChange = (e) => {
    setPurchasedCounty(e.target.value)
  }

  const handleTabClicked = async(index) => {
    if(index == 0){
      const courtData = await getPurchasedCourts();    
    }
    setActiveTab(index)
  }

  
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
                  {caseTypes
                    .filter(court => court.name && court.name.trim() !== "")
                    .map((court, index) => (
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
                  {courts
                  .filter(court => court.name && court.name.trim() !== "")
                  .map((court, index) => (
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
                {counties
                  .filter(court => court.name && court.name.trim() !== "")
                  .map((court, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-gray-400 text-center w-12 py-1">{court.count}</div>
                      <div className="ml-2 truncate">{court.name}</div>
                    </div>
                  ))
                }
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
                  onClick={() => handleTabClicked(index)}
                >
                  {tab}
                </li>
              ))}
              <button
                type="button"
                onClick={() => setShowSettingsPanel(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="h-4 w-4" />
              </button>
            </ul>
            <div style={styles.tabContent}>
              <style>{scrollbarStyles}</style>
              
              {activeTab === 0 && 
              <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h1 className="text-xl font-semibold text-gray-900">County & Court Directory</h1>
                    </div>
                    <p className="text-sm text-gray-600">Select a county to view all purchased courts</p>
                  </div>
          
                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* County Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Select County</label>
                      </div>
          
                      <div className="relative">
                        <select
                          value={purchasedCounty}
                          onChange={handleCountyChange}
                          className="w-full p-3 pr-10 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                        >
                          {purchasedCountiesData.map((county) => (
                            <option key={county.identifier} value={county.identifier}>
                              {county.name} 
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
          
                    {/* Courts Display */}
                    {currentPurchasedCounty && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <h3 className="text-lg font-medium text-gray-900">Courts in {currentPurchasedCounty.name}</h3>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md border">
                            {currentPurchasedCourts.length} {currentPurchasedCourts.length === 1 ? "court" : "courts"}
                          </span>
                        </div>
          
                        <div className="space-y-3">
                          {currentPurchasedCourts.map((court) => (
                            <div
                              key={court.identifier}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <div className="space-y-1">
                                  <h4 className="font-medium text-gray-900">{court.courts}</h4>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>}
              {activeTab === 1 && 
              <div className="w-full max-w-4xl mx-auto p-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      County & Court Selection Panel
                    </h2>
          
                    {/* Payment and Limit Info */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Payment: ${currentPayment}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                          <Building2 className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Selected: {allSelectedCourts.length}/{MAX_COURTS}
                          </span>
                        </div>
                      </div>
          
                      {allSelectedCourts.length >= MAX_COURTS && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">Maximum courts selected</span>
                        </div>
                      )}
                    </div>
                  </div>
          
                  <div className="p-6 space-y-6">
                    {/* County Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Select County
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                          <span className={selectedCounty ? "text-gray-900" : "text-gray-500"}>
                            {selectedCounty ? countiesData[selectedCounty].name : "Choose a county..."}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                          />
                        </button>
          
                        {isDropdownOpen && (
                          <div
                            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                            style={{
                              maxHeight: `${Math.min(Object.keys(countiesData).length * 40 + 16, window.innerHeight * 0.6)}px`,
                              overflowY:
                                Object.keys(countiesData).length * 40 + 16 > window.innerHeight * 0.6 ? "auto" : "visible",
                            }}
                          >
                            {Object.entries(countiesData).map(([key, county]) => (
                              <button
                                key={key}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
                                onClick={() => {
                                  toggleCaseSelection(key, '')
                                  setSelectedCounty(key)
                                  setIsDropdownOpen(false)
                                }}
                              >
                                {county.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
          
                    {/* Courts Selection */}
                    {selectedCounty && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Select Courts in {countiesData[selectedCounty].name}
                          </label>
                          <button
                            type="button"
                            className={`px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1 ${
                              canSelectMoreCourts
                                ? "border-gray-300 hover:bg-gray-50"
                                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            }`}
                            onClick={handleSelectAll}
                            disabled={!canSelectMoreCourts && selectedCourts.length === 0}
                          >
                            {allSelected ? <X className="h-3.5 w-3.5" /> : <CheckSquare className="h-3.5 w-3.5" />}
                            {allSelected ? "Deselect All" : "Select All"}
                          </button>
                        </div>
          
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {availableCourts.map((court) => {
                            const isSelected = selectedCourts.includes(court.id)
                            const isDisabled = !isSelected && !canSelectMoreCourts
          
                            return (
                              <div
                                key={court.id}
                                className={`flex items-center space-x-3 p-2 rounded-lg ${
                                  isDisabled ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  id={court.id}
                                  checked={isSelected}
                                  onChange={() => handleCourtToggle(court.id, countiesData[selectedCounty].name, court.courts)}
                                  disabled={isDisabled}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <label
                                  htmlFor={court.id}
                                  className={`text-sm font-medium cursor-pointer flex-1 flex items-center gap-2 ${
                                    isDisabled ? "text-gray-400 cursor-not-allowed" : "text-gray-700"
                                  }`}
                                >
                                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                  {court.courts}
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
          
                    {/* Selection Summary */}
                    {selectedCourts.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          Selected Courts in Current County ({selectedCourts.length})
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedCourts.map((courtId) => {
                            const court = availableCourts.find((c) => c.id === courtId)
                            return (
                              <span
                                key={courtId}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                <Check className="h-3 w-3" />
                                {court?.courts}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
          
                    {/* Payment Breakdown */}
                    {allSelectedCourts.length > 0 && (
                      <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-medium text-blue-900 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Payment Breakdown
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Selected Courts:</span>
                            <span className="font-medium text-blue-900">{allSelectedCourts.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Rate per Selection:</span>
                            <span className="font-medium text-blue-900">
                              {allSelectedCourts.length === 1 && "$200"}
                              {allSelectedCourts.length === 2 && "$200 each"}
                              {allSelectedCourts.length === 3 && "Special rate"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-blue-200">
                            <span className="font-medium text-blue-900">Total Payment:</span>
                            <span className="font-bold text-blue-900 text-lg">${currentPayment}</span>
                          </div>
                        </div>
                      </div>
                    )}
          
                    {/* Action Buttons */}
                    {allSelectedCourts.length > 0 && (
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleProceedPayment()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Save className="h-4 w-4" />
                          Proceed to Payment (${currentPayment})
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCounty("")
                            setSelectedCourts([])
                            setAllSelectedCourts([])
                            setIsDropdownOpen(false)
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Clear All
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSettingsPanel(false)}
                          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
          
                  {/* Bottom Panel - All Selected Courts */}
                  {allSelectedCourts.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <List className="h-5 w-5" />
                            All Selected Courts ({allSelectedCourts.length}/{MAX_COURTS})
                          </h3>
                          <div className="text-lg font-bold text-blue-600">Total: ${currentPayment}</div>
                        </div>
          
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {allSelectedCourts.map((court) => (
                            <div
                              key={`${court.countyId}-${court.id}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-blue-600" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{court.courts}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {court.county}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCourtFromSelection(court.id)}
                                className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
                                title="Remove court"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>}
              {activeTab === 2 && 
              <div className="w-full max-w-6xl mx-auto p-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                      <Upload className="h-6 w-6" />
                      Template Upload Manager(Letters & Envelopes)
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                      Upload multiple letter and envelope templates. Supported formats: .docx (Word documents) and .txt (text
                      files).
                    </p>
                  </div>
          
                  <div className="p-6">
                    {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> */}
                    <div className="grid grid-cols-1 gap-8">
                      {/* Letter Templates Section */}
                      <div className="space-y-6">
                        {renderUploadArea("letter", <FileText className="h-5 w-5 text-blue-600" />)}
                        {selectedLetterTemplate &&
                          letterPreview &&
                          renderPreview(letterPreview, selectedLetterTemplate, "letter")}
                      </div>
          
                      {/* Envelope Templates Section */}
                      {/* <div className="space-y-6">
                        {renderUploadArea("envelope", <Mail className="h-5 w-5 text-green-600" />)}
                        {selectedEnvelopeTemplate &&
                          envelopePreview &&
                          renderPreview(envelopePreview, selectedEnvelopeTemplate, "envelope")}
                      </div> */}
                    </div>
          
                    {/* Template Summary */}
                    {(letterTemplates.length > 0 || envelopeTemplates.length > 0) && (
                      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Templates Summary</h4>
                        <div className="space-y-2 text-sm">
                          {/* <div className="flex justify-between">
                            <span className="text-gray-600">Letter Templates:</span>
                            <span className="font-medium text-gray-900">{letterTemplates.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Envelope Templates:</span>
                            <span className="font-medium text-gray-900">{envelopeTemplates.length}</span>
                          </div> */}
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-600">Total Templates:</span>
                            <span className="font-medium text-gray-900">{letterTemplates.length + envelopeTemplates.length}</span>
                          </div>
                        </div>
          
                        {/* Action Buttons */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex gap-4">
                            <button
                              onClick={() => {
                                console.log("Letter Templates:", letterTemplates)
                                console.log("Envelope Templates:", envelopeTemplates)
                                console.log("Selected Letter Template:", selectedLetterTemplate)
                                console.log("Selected Envelope Template:", selectedEnvelopeTemplate)
                                console.log("Template Variables:", templateVariables)
                                console.log("Processed Content:", processedContent)
                                saveAllTemplates()
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <Check className="h-4 w-4" />
                              Save Templates
                            </button>
                            <button
                              onClick={() => {
                                clearAllTemplates("letter")
                                clearAllTemplates("envelope")
                                setTemplateVariables({
                                  defendant_name: "John Doe",
                                  case_number: "CV-2024-001",
                                  court: "Superior Court of California",
                                  file_date: "2024-06-01",
                                  appear_by_date: "2024-07-15",
                                })
                                setProcessedContent({ letter: null, envelope: null })
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <X className="h-4 w-4" />
                              Clear All
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>}
              {activeTab === 3 && 
              <div className="w-full max-h-[90vh] overflow-hidden flex justify-center">
                {/* Content */}
                <div className="w-full p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* Add New Pair Form */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Field Mapping</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Field Name Dropdown */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsFieldDropdownOpen(!isFieldDropdownOpen)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <span className={newPair.field ? "text-gray-900" : "text-gray-500"}>
                              {newPair.field || "Select field name..."}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`text-gray-400 transition-transform ${isFieldDropdownOpen ? "rotate-180" : ""}`}
                            />
                          </button>
        
                          {isFieldDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {fileldLoading ? (
                                <div className="px-3 py-2 text-gray-500">Loading...</div>
                              ) : (
                                fieldList.map((fieldName, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleFieldNameSelect(fieldName.field)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                  >
                                    {fieldName.field}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
        
                      {/* Shortcode Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shortcode</label>
                        <input
                          type="text"
                          value={newPair.shortcode}
                          onChange={(e) => setNewPair({ ...newPair, shortcode: e.target.value })}
                          placeholder="[[SHORTCODE]]"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
        
                    <button
                      onClick={addPair}
                      disabled={!newPair.field || !newPair.shortcode}
                      className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Shortcode
                    </button>
                  </div>
        
                  {/* Existing Pairs Table */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Current Field Mappings ({savedShortCode.length})</h3>
        
                    {savedShortCode.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No field mappings added yet.</div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Field Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Shortcode
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {savedShortCode.map((pair, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">{pair.field}</td>
                                <td className="px-4 py-3 text-sm font-mono text-gray-600 bg-gray-50">{pair.shortcode}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => removePair(index, pair.field, pair.shortcode)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                    title="Remove pair"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>}
              {activeTab === 4 && 
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
              {activeTab === 5 && 
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
                              <div className="cursor-pointer" onClick={() => toggleCaseSelection(caseType.courts, '')}>
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
              {activeTab === 6 && 
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
    width: '1000px',
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
    height: '600px',
    overflowY: 'auto', 
    maxHeight: '100vh',
    padding: '20px',
    borderTop: '1px solid #ccc',
    background: '#fff',
    fontSize: '16px',
    lineHeight: '24px',
  },
};




