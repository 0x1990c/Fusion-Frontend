"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, ChevronRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import headermark from "../../src/assets/fusion-icon.svg";
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { X, Calendar } from "lucide-react"
import { loadingOff, loadingOn } from '../store/authSlice'
import { getData, getCases, getCounties } from '../services/main';

// Filter section component
const FilterSection = ({ title, options, expanded, onToggle, onFilterChange }) => {

  const [allChecked, setAllChecked] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleAllCheckboxChange = () => {
    setAllChecked(!allChecked);
    setSelectedOptions(allChecked ? [] : options.map(option => option.name));
  };

  const handleCheckboxChange = (option) => {
    if (selectedOptions.includes(option.name)) {
      setSelectedOptions(selectedOptions.filter(name => name !== option.name));
      onFilterChange(selectedOptions.filter(name => name !== option.name));
    } else {
      setSelectedOptions([...selectedOptions, option.name]);
      onFilterChange([...selectedOptions, option.name]);
    }
  };
  
  return (
    <div className="border-b border-gray-300">
      <div className="flex items-center bg-blue-100 p-2 cursor-pointer" onClick={onToggle}>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="text-blue-800 font-bold ml-1">{title}</span>
      </div>
      {expanded && (
        <div className="p-2">
          <div className="flex items-center mb-1">
            <input
              type="checkbox"
              id={`all${title.replace(/\s+/g, "")}`}
              name={title}
              className="mr-2"
              checked={allChecked}
              onChange={handleAllCheckboxChange}
            />
            <label htmlFor={`all${title.replace(/\s+/g, "")}`} className="text-sm">
              ALL
            </label>
          </div>
          <div className="ml-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  id={`${title.toLowerCase()}-${option.name}`}
                  className="mr-2"
                  checked={selectedOptions.includes(option.name)}
                  onChange={() => {
                    handleCheckboxChange(option);
                  }}
                />
                <label htmlFor={`${title.toLowerCase()}-${option.name}`} className="text-xs">
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Date filter component
const DateFilterSection = ({ expanded, onToggle, onDateFilterChange }) => {

  const [fromDate, setFromDate] = useState(new Date("04/13/2018"))
  const [toDate, setToDate] = useState(new Date())

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCheckboxChange = (e) => {
    setShowDatePicker(!e.target.checked);
    onDateFilterChange(new Date("04/13/2018"), new Date());
  };

  const handleDateChange = () => {
    onDateFilterChange(fromDate, toDate);
  };

  return (
    <div className="border-b border-gray-300">
      <div className="flex items-center bg-blue-100 p-2 cursor-pointer" onClick={onToggle}>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="text-blue-800 font-bold ml-1">Date Filter</span>
      </div>

      {expanded && (
        <div className="p-2">
          <div className="flex items-center mb-1">
            <input
              type="checkbox"
              id="all"
              name="date"
              className="mr-2"
              defaultChecked
              onChange={handleCheckboxChange}
            />
            <label htmlFor="all" className="text-sm">
              ALL
            </label>
          </div>
          <div
            className={`mt-2 ${showDatePicker ? "" : "hidden"}`}
          >
            <div className="mb-2">
              <label className="text-xs block mb-1">From</label>
              <div className="flex">
                <DatePicker
                  id="from-date"
                  selected={fromDate}
                  onChange={(date) => {
                    setFromDate(date);
                    handleDateChange();
                  }}
                  dateFormat="MM/dd/yyyy"
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs block mb-1">To</label>
              <div className="flex">
                <DatePicker
                  id="to-date"
                  selected={toDate}
                  onChange={(date) =>{
                    setToDate(date);
                    handleDateChange();
                  }}
                  dateFormat="MM/dd/yyyy"
                  className="w-48 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ActionPanel = ({ recordCount, onApplyFilters, onExport, onMailMerge }) => {
  // Styles defined inline
  const styles = {
    actionPanel: {
      width: "100%",
      maxWidth: "300px",
      fontFamily: "Arial, sans-serif",
    },
    recordCount: {
      textAlign: "center",
      color: "#0066cc",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    actionButtons: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
    },
    actionButton: {
      backgroundColor: "#2b79c2",
      color: "white",
      border: "none",
      padding: "10px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: "14px",
    },
    buttonIcon: {
      marginRight: "8px",
      display: "flex",
      alignItems: "center",
    },
  }

  // Function to handle button hover effect
  const handleMouseOver = (e) => {
    e.currentTarget.style.backgroundColor = "#1e5c99"
  }

  const handleMouseOut = (e) => {
    e.currentTarget.style.backgroundColor = "#2b79c2"
  }

  
  return (
    <div style={styles.actionPanel}>
      {/* Record Count */}
      <div style={styles.recordCount}>{recordCount} RECORDS</div>
      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          style={styles.actionButton}
          onClick={onApplyFilters}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <span style={styles.buttonIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </span>
          APPLY FILTERS
        </button>
        <button
          style={styles.actionButton}
          onClick={onMailMerge}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <span style={styles.buttonIcon}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </span>
          MAIL MERGE
        </button>
      </div>
    </div>
  )
}

export const MailMerge = () => {

  const dispatch = useDispatch()

  const [expandedFilters, setExpandedFilters] = useState({
    caseType: true,
    court: true,
    county: true,
    date: true,
  })

  const [caseData, setCaseData] = useState([]);
  const [courtsFilter, setCourts] = useState([]);
  const [caseTypesFilter, setCaseTypes] = useState([]);
  const [countiesFilter, setCounties] = useState([]);
  const [pageOffset, setPageOffset] = useState(0);
  
  const [selectedCaseTypes, setSelectedCaseTypes] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState([]);

  const [allPageCount, setAllPageCount] = useState(1);
  const [allCases, setAllCases] = useState(0);

  const [fromDate, setFromDate] = useState(new Date("04/13/2018"))
  const [toDate, setToDate] = useState(new Date());
  
  const [canPreviousPage, setCanPreviousPage] = useState(true)
  const [canNextPage, setCanNextPage] = useState(true)
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const navigate = useNavigate()

  const fields = [
    "ID",
    "CaseCategoryKey",
    "CaseCategoryGroup",
    "CaseNumber",
    "Court",
    "CourtCode",
    "IsAppellateCourt",
    "FileDate",
    "CaseStatus",
    "CaseStatusDate",
    "CaseType",
    "CaseSubType",
    "Style",
    "IsActive",
    "IsPublic",
    "AppearByDate",
    "BondAmount",
    "BondNumber",
    "BondStatus",
    "DefendantName",
    "DefendantAddress",
    "DefendantAddressCity",
    "DefendantAddressState",
    "DefendantAddressZip",
    "DefendantAddressZip4",
    "PartyName1",
    "PartyConnectionType1",
    "PartyConnectionKey1",
    "PartyAddress1",
    "PartyName2",
    "PartyConnectionType2",
    "PartyConnectionKey2",
    "PartyAddress2",
    "PartyName3",
    "PartyConnectionType3",
    "PartyConnectionKey3",
    "PartyAddress3",
    "PartyName4",
    "PartyConnectionType4",
    "PartyConnectionKey4",
    "PartyAddress4",
    "PartyName5",
    "PartyConnectionType5",
    "PartyConnectionKey5",
    "PartyAddress5",
    "OtherParties",
    "OffenseDate1",
    "OffenseStatute1",
    "OffenseDescription1",
    "OffenseDegree1",
    "OffenseDate2",
    "OffenseStatute2",
    "OffenseDescription2",
    "OffenseDegree2",
    "OffenseDate3",
    "OffenseStatute3",
    "OffenseDescription3",
    "OffenseDegree3",
    "OffenseDate4",
    "OffenseStatute4",
    "OffenseDescription4",
    "OffenseDegree4",
    "OffenseDate5",
    "OffenseStatute5",
    "OffenseDescription5",
    "OffenseDegree5",
    "OtherOffenses",
    "EventDate1",
    "EventType1",
    "EventDescription1",
    "EventDate2",
    "EventType2",
    "EventDescription2",
    "EventDate3",
    "EventType3",
    "EventDescription3",
    "EventDate4",
    "EventType4",
    "EventDescription4",
    "EventDate5",
    "EventType5",
    "EventDescription5",
    "OtherEvents"
  ];
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tableColumns = fields.map(field => ({
    id: field.toLowerCase().replace(/ /g, ''), // Convert to lowercase and remove spaces
    label: field // Keep the original field name as label
  }));
  
  useEffect(() => {
    if(pageOffset == 0){
      dispatch(loadingOn());
      fetchData(pageOffset);
      fetchFilterCondition();
    }
  }, [])

 const fetchData = async (pageOffset) => {

    const data = {
      fromDate: fromDate,
      toDate: toDate,
      offset: pageOffset,
      selectedCaseTypes: selectedCaseTypes,
      selectedCourt: selectedCourt,
      selectedCounty: selectedCounty
    }

    const casesData = await getData(data);
    const totalCount = casesData.cases.total_count;
    setAllCases(totalCount);
    const result = Math.floor(totalCount / 100);
    setAllPageCount(result);
    setCaseData(casesData.cases.data);
  };

  const fetchFilterCondition = async () => {
    const data = {
      fromDate: fromDate,
      toDate: toDate
    }

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

  const toggleFilter = (filter) => {
    setExpandedFilters({
      ...expandedFilters,
      [filter]: !expandedFilters[filter],
    })
  }

  const goMainMenu = () =>{
    navigate('/main')
  }

  const handleApplyFilters = () => {
    dispatch(loadingOn());
    setPageOffset(0);
    fetchData(0);
  }

  const handleFilterChange = (filterName, options) => {
    if (filterName === "caseType") {
      setSelectedCaseTypes(options);
    }else if (filterName === "court") {
      setSelectedCourt(options);
    }else if (filterName === "county") {
      setSelectedCounty(options);
    }
  };

  const handleExport = () => {
  }

  const handleMailMerge = () => {
    console.log("handleMailMerge");
  }

  const gotoPage = () => {

  }
  
  const previousPage = () => {
    if(pageOffset > 0){
      setPageOffset(pageOffset - 1);
      dispatch(loadingOn());
      fetchData(pageOffset - 1)
    }
  }

  const nextPage = () => {
    var offset = pageOffset + 1;
    setPageOffset(offset);
    dispatch(loadingOn());
    fetchData(pageOffset + 1)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="w-1/6 p-3 flex flex-row items-center">
        <img src={headermark} alt="" width={40} height={40}/>
        <span style={styles.title} className="cursor-pointer" onClick={() => goMainMenu()}>Fusion Menu</span>
      </div>

      {/* Main Content */}
      <div style={{ ...styles.container, ...(isMobile ? styles.containerMobile : {}) }}>
        {/* Left Sidebar - Filters */}
        <div style={isMobile ? styles.sidebarMobile : styles.sidebar}>
          {/* Case Type Filter */}
          <FilterSection
            title="Case Type Filter"
            options={caseTypesFilter}
            expanded={expandedFilters.caseType}
            onToggle={() => toggleFilter("caseType")}
            onFilterChange={(options) => handleFilterChange("caseType", options)}
          />

          {/* Court Filter */}
          <FilterSection
            title="Court Filter"
            options={courtsFilter}
            expanded={expandedFilters.court}
            onToggle={() => toggleFilter("court")}
            onFilterChange={(options) => handleFilterChange("court", options)}
          />

          {/* County Filter */}
          <FilterSection
            title="County Filter"
            options={countiesFilter}
            expanded={expandedFilters.county}
            onToggle={() => toggleFilter("county")}
            onFilterChange={(options) => handleFilterChange("county", options)}
          />

          {/* Date Filter */}
          <DateFilterSection 
            expanded={expandedFilters.date} 
            onToggle={() => toggleFilter("date")}
            onDateFilterChange={(from, to) => {
              setFromDate(from);
              setToDate(to);
            }}
          />

          <div style={{ padding: "20px",  display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <ActionPanel
              recordCount={allCases}
              onApplyFilters={handleApplyFilters}
              onExport={handleExport}
              onMailMerge={handleMailMerge}
            />
          </div>
        </div>

        <div style={isMobile ? styles.mainContentMobile : styles.mainContent}>
          {/* Main Content - Data Table */}
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200" style={{ position: 'sticky', top: 0, backgroundColor: '#E5E7EB' }}>
                  {tableColumns.map((column) => (
                    <th key={column.id} className="border border-gray-300 p-1 text-xs font-bold text-left">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {caseData.map((caseItem, index) => (
                  <tr key={caseItem.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.id}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CaseCategoryKey}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CaseCategoryGroup}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CaseNumber}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.Court}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CourtCode}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.IsAppellateCourt}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.FileDate}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CaseStatus}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CaseStatusDate}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CaseType}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.CaseSubType}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.Style}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.IsActive}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.IsPublic}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.AppearByDate}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.BondAmount}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.BondNumber}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.BondStatus}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.DefendantName}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.DefendantAddress}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.DefendantAddressCity}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.DefendantAddressState}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.DefendantAddressZip}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.DefendantAddressZip4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyName1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionType1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionKey1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyAddress1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyName2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionType2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionKey2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyAddress2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyName3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionType3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionKey3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyAddress3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyName4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionType4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionKey4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyAddress4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyName5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionType5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyConnectionKey5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.PartyAddress5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OtherParties}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDate1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseStatute1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDescription1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDegree1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDate2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseStatute2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDescription2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDegree2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDate3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseStatute3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDescription3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDegree3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDate4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseStatute4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDescription4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDegree4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDate5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseStatute5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDescription5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OffenseDegree5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OtherOffenses}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDate1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventType1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDescription1}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDate2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventType2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDescription2}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDate3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventType3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDescription3}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDate4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventType4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDescription4}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDate5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventType5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.EventDescription5}</td>
                    <td className="border border-gray-300 p-1 text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{caseItem.Case.OtherEvents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center'}}>
            <div>
              <button style={styles.paginationButton} onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                {'<<'}
              </button>{' '}
              <button style={styles.paginationButton} onClick={() => previousPage()} disabled={!canPreviousPage}>
                {'<'}
              </button>{' '}
              <span>
                <strong>
                  {pageOffset + 1} / {allPageCount}
                </strong>{' '}
              </span>
              <button style={styles.paginationButton} onClick={() => nextPage()} disabled={!canNextPage}>
                {'>'}
              </button>{' '}
              <button style={styles.paginationButton} onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                {'>>'}
              </button>{' '}
            </div>
          </div>
        </div>
      </div>
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
    paginationButton: {
      backgroundColor: 'blue',
      border: 'none',
      color: 'white',
      padding: '10px 20px',
      textAlign: 'center',
      textDecoration: 'none',
      display: 'inline-block',
      fontSize: '16px',
      margin: '4px 2px',
      cursor: 'pointer',
      borderRadius: '4px',
    },
    container: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
      flexDirection: 'row', // Default to horizontal
    },
    containerMobile: {
      flexDirection: 'column', // Change to vertical on mobile
    },
    sidebar: {
      width: '16.67%', // 1/6 of the width
      backgroundColor: 'white',
      borderRight: '1px solid #D1D5DB', // border-gray-300
      overflowY: 'auto',
    },
    sidebarMobile: {
      width: '100%', // 1/6 of the width
      height: '50%',
      backgroundColor: 'white',
      borderRight: '1px solid #D1D5DB', // border-gray-300
      overflowY: 'auto',
    },
    mainContent: {
      width: '83.33%', // 5/6 of the width
      overflow: 'auto',
    },
    mainContentMobile: {
      width: '100%', // 5/6 of the width
      height: '50%',
      overflow: 'auto',
    },
  };
  

  // <td
  //   className={`border border-gray-300 p-1 text-xs cursor-pointer ${
  //     isExpanded ? "whitespace-normal" : "whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
  //   }`}
  //   onClick={() => setIsExpanded(!isExpanded)}
  //   title={isExpanded ? "Click to collapse" : "Click to expand"}
  // >{caseItem.Case.CaseType}</td>