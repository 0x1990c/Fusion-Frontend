import React from 'react'
import { MessagesTable } from '../components/messages/MessagesTable'

export const Messages = () => {
    return (
        <div className="w-[100%] h-[100vh] bg-cover bg-[url('/bg2.jpg')]"> 
            <div className="hidden md:block">
                <MessagesTable />
            </div>
            <div className="block md:hidden">
                {/* <NotificationsBox /> */}
            </div>
        </div>
    )
}
