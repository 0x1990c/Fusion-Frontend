import React from 'react'
import { ClientsTable } from '../components/clients/ClientsTable'

export const Clients = () => {
    return (
        <div className="w-[100%] h-[100vh] bg-cover bg-[url('/bg2.jpg')]"> 
            <div className="hidden md:block">
                <ClientsTable />
            </div>
            <div className="block md:hidden">
                {/* <NotificationsBox /> */}
            </div>
        </div>
    )
}
