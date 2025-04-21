import { NotificationsTable } from "../components/notifications/NotificationsTable";
import { NotificationsBox } from "../components/notifications/NotificationsBox";

export const Notifications = () => {
    
    return (
        <div className="w-[100%] h-[100vh] bg-cover bg-[url('/bg.png')]"> 
            <div className="hidden md:block">
                <NotificationsTable />
            </div>
            <div className="block md:hidden">
                <NotificationsBox />
            </div>
        </div>
    )
}
