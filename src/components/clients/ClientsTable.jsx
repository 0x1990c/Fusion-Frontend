import React, { useEffect, useState } from 'react'
import { Dropdown } from './Dropdown'
import { useDispatch, useSelector } from 'react-redux'
import { loadingOff, loadingOn } from '../../store/authSlice'
import { setClients } from '../../store/clientSlice'
import { setCategories } from '../../store/categorySlice'
import { getClients, getCustomerCategories, deleteClient } from '../../services/clients'
import { Navbar } from '../common/Navbar'
import { FiFile } from 'react-icons/fi'
import { addClient } from '../../services/clients'
import { SettingsModal } from '../Settings/SettingsModal'
import { IoMdRefresh } from 'react-icons/io'
import { AiTwotoneDelete } from "react-icons/ai";
import { MdOutlineEdit } from "react-icons/md";
import { EditClientModal } from './EditClientModal';
import toast from 'react-hot-toast'

export const ClientsTable = () => {
    const [phoneNumbers, setPhoneNumbers] = useState([''])
    const [filePath, setFilePath] = useState(null)
    const [selectedCategories, setSelectedCategories] = useState([])
    const dispatch = useDispatch()
    const clients = useSelector(state => state.client.data)
    const categories = useSelector(state => state.category.categories)
    const [refetch, setRefetch] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(loadingOn());
        fetchData();
        dispatch(loadingOff())
    }, [refetch])

    const fetchData = async () => {
        
        let clients = await getClients();
        let categories = await getCustomerCategories();
        
        if (clients && clients.detail === "Could not validate credentials") {
            alert('Unauthorized user!');
            navigate('/signin')
        }

        if (clients) {
            if (Array.isArray(clients)) {
                dispatch(setClients(clients))
                dispatch(setCategories(categories))
            }
        }
    }

    const handleAddPhoneInput = () => {
        setPhoneNumbers([...phoneNumbers, ''])
    }

    const handlePhoneChange = (index, value) => {
        const updatedNumbers = [...phoneNumbers];
        updatedNumbers[index] = value;
        setPhoneNumbers(updatedNumbers);
    }

    const handleRemovePhoneInput = (index) => {
        const updatedNumbers = phoneNumbers.filter((_, i) => i !== index)
        setPhoneNumbers(updatedNumbers)
    }

    const handleAddClient = async () => {

        const validPhoneNumbers = phoneNumbers
                                    .map(num => num.trim()) // Remove whitespace
                                    .map(num => num.replace(/\s+/g, '')) // Remove whitespace middle of string
                                    .map(num => (num.startsWith('+') ? num : '+' + num)); // Add '+' if missing                                          

        if (validPhoneNumbers.length === 0) {
            alert('Please enter at least one phone number');
            return;
        }

        if (selectedCategories.length === 0) {
            alert('Please select at least one category');
            return;
        }

        try {
            dispatch(loadingOn());
            
            const clientData = {
                phone_numbers: validPhoneNumbers,
                categories: selectedCategories
            };
            
            const response = await addClient(clientData);

            if (response.message !== "Customer added successfully" && response.status !== 200) {
                throw new Error('Failed to add client');
            }else{
                toast.success(response.message);
            }

            setPhoneNumbers(['']);
            setSelectedCategories([]);
            setFilePath(null);

            // Optionally reset categories
            // setSelectedCategories([]);
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client');
        } finally {
            console.log("handle add client")
            setRefetch(!refetch);
            dispatch(loadingOff());
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFilePath(file)
            
            // Read the file contents
            const reader = new FileReader()
            reader.onload = (event) => {
                const content = event.target.result
                // Split content by newlines and handle different delimiters (comma or pipe)
                const numbers = content
                    .split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(line => line) // Remove empty lines
                    .flatMap(line => {
                        // Try splitting by comma first, then by pipe if no commas found
                        const parts = line.includes(',') ? 
                            line.split(',') : 
                            line.split('|')
                        return parts.map(part => part.trim())
                    })
                    .filter(number => number) // Remove empty values

                if (numbers.length > 0) {
                    // Update phone number fields
                    setPhoneNumbers(numbers)
                } else {
                    alert('No valid phone numbers found in the file')
                    setFilePath(null)
                    e.target.value = '' // Reset file input
                }
            }

            reader.onerror = () => {
                alert('Error reading file')
                setFilePath(null)
                e.target.value = '' // Reset file input
            }

            // Read file as text
            reader.readAsText(file)
        }
    }

    const handleCategoryChange = (categories) => {
        setSelectedCategories(categories);
        // You can perform any additional actions here when categories change
    }

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = clients.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(clients.length / itemsPerPage)

    const pageNumbers = []
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
    }

    const handleSubmit = async (editedData) => {
        dispatch(loadingOn())
        try {
            // Handle any settings updates here
            setIsSettingsModalOpen(false)
            setRefetch(!refetch)
        } catch (error) {
            toast.error(error.message || "Failed to update settings")
        }
        dispatch(loadingOff())
    }

    const handleEditClick = (client) => {
        // console.log(client.id);
        setIsEditModalOpen(true);
    };

    const handleDeleteClient = async (id) => {
        dispatch(loadingOn());
        
        let res = await deleteClient(id);

        if (res.detail === "Could not validate credentials") {
            alert('Unauthorized user!');
            navigate('/signup')
        }

        if (res.success) {
            toast.dismiss()
            toast.success("Successfully deleted the client!");
            setRefetch(!refetch);
        }
        dispatch(loadingOff());
    }

    
    return (
        <div>
            <Navbar />

            <div>
                <div className='flex items-center justify-between gap-5 bg-white px-5 mb-[2px] py-1'>
                    <div className="flex items-center gap-5">
                        <Dropdown 
                            onCategorySelect={(newSelectedCategories) => {
                                setSelectedCategories(newSelectedCategories);
                            }}
                        />

                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-2'>
                                <input 
                                    type='text'
                                    className='border border-gray-300 bg-gray-200 text-lg px-3 py-1 text-gray-500 rounded-sm w-96'
                                    placeholder='Phone Numbers (e.g. +1 098 765 4321)'
                                    value={phoneNumbers.join(',')}
                                    onChange={(e) => {
                                        const numbers = e.target.value.split(',');
                                        setPhoneNumbers(numbers);
                                    }}
                                />
                            </div>
                        </div>

                        <span className='text-gray-500 text-lg'>or</span>

                        <div className="relative">
                            <input 
                                type="file" 
                                id="phone-numbers-file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".csv,.xlsx,.xls, .txt"
                            />
                            <label 
                                htmlFor="phone-numbers-file" 
                                className="flex items-center gap-2 cursor-pointer bg-gray-200 text-gray-500 py-1 px-3 rounded-sm"
                            >
                                <FiFile className="text-lg" />
                                <span>{filePath ? filePath.name : 'Choose file'}</span>
                            </label>
                        </div>

                        <button 
                            className='bg-green-500 text-white px-5 py-1 rounded-sm text-lg font-semibold'
                            onClick={handleAddClient}
                        >
                            ADD
                        </button>
                    </div>

                    <div className="flex-shrink-0">
                        <button
                            onClick={() => setIsSettingsModalOpen(true)}
                            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors duration-200"
                        >
                            Settings
                        </button>
                    </div>
                </div>

                <table className="w-[100%]">
                    <thead className=" bg-red-700">
                        <tr>
                            <th className="w-[5%] text-center p-2 text-lg text-white">ID</th>
                            <th className="w-[30%] text-center p-2 text-lg text-white">Cell Phone</th>
                            <th className="w-[20%] text-white text-lg text-center">Last Received</th>
                            <th className="w-[20%] text-white text-lg text-center">List</th>
                            <th className="w-[10%] text-white text-lg text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="table-body-transparent">
                        {currentItems.map((item, index) => (
                            <tr key={index} className="bg-red-700 border-t-2 border-t-white">
                                <td className="text-center p-2 text-white">{indexOfFirstItem + index + 1}</td>
                                <td className="text-center p-2 text-white">
                                    {item.phone_numbers[0]}
                                    {item.phone_numbers.length > 1 && (
                                        <span className="text-gray-500 text-sm ml-2 text-white">
                                            (+{item.phone_numbers.length - 1} more)
                                        </span>
                                    )}
                                </td>
                                <td className="text-center p-2 text-white">{item.last_received || '-'}</td>
                                <td className="text-center p-2 text-white">
                                    {item.categories ? categories.filter(cat => item.categories.includes(cat.id)).map(cat => cat.name).join(', ') : '-'}
                                </td>

                                <td>
                                    <div className='flex items-center justify-center gap-1'>
                                        {/* <MdOutlineEdit 
                                            className="text-3xl text-white cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors" 
                                            onClick={() => handleEditClick(item)}
                                        /> */}
                                        <AiTwotoneDelete 
                                            className="text-2xl text-white cursor-pointer hover:bg-white/20 rounded-full p-1 transition-colors"
                                            onClick={() => handleDeleteClient(item.id)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center mt-4 gap-2">
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-red-700 text-white rounded disabled:opacity-50"
                >
                    Previous
                </button>
                
                {/* {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`px-4 py-2 rounded ${
                            currentPage === number 
                                ? 'bg-white text-red-700' 
                                : 'bg-red-700 text-white'
                        }`}
                    >
                        {number}
                    </button>
                ))} */}
                
                <button
                    key={currentPage}
                    onClick={() => setCurrentPage(currentPage)}
                    className="px-4 py-2 bg-white text-red-700 rounded disabled:opacity-50">
                    {currentPage}
                </button>
                
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-red-700 text-white rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            <div className="text-center mt-2 text-white">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, clients.length)} of {clients.length} entries
            </div>

            {isSettingsModalOpen && (
                <SettingsModal
                    isOpen={isSettingsModalOpen}
                    onClose={() => setIsSettingsModalOpen(false)}
                    onSubmit={handleSubmit}
                    showOptinEdit={false}
                />
            )}

            <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                }}
            />
        </div>
    )
}
