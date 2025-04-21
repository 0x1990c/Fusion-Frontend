import React from 'react'
import { PhonesTable } from '../components/phones/PhonesTable'

export const Phones = () => {
    return (
        <div className="w-[100%] h-[100vh] bg-cover bg-[url('/bg2.jpg')]"> 
            <div className="hidden md:block">
                <PhonesTable />
            </div>
            <div className="block md:hidden">
                {/* <NotificationsBox /> */}
            </div>
        </div>
    )
}
