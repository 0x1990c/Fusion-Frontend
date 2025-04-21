import { useState } from "react"

// eslint-disable-next-line react/prop-types
export const EditMessageModal = ({message, onSave, onCancel}) => {
    const [text, setText] = useState(message);

    const handleChangeText = (e) => {
        setText(String(e.target.value))
        console.log(e.target.value)
    }

    return (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center sm:min-h-full justify-center p-4 text-center sm:items-center">
                
                    <div className="relative w-[80%] transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pt-5 sm:p-6 sm:pb-4">
                            <div className="px-2">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Edit message</h3>
                                    <div className="mt-2">
                                        <textarea id="message" rows="4" className="block p-2.5 w-[100%] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Edit you message here..."
                                            value={text} onChange={handleChangeText}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 pb-6 px-4 py-3 flex flex-col-reverse sm:flex sm:flex-row-reverse sm:px-6 sm:gap-3">
                            <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                onClick={() => onSave(text)}
                            >Save</button>
                            <button type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                onClick={onCancel}
                            >Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
