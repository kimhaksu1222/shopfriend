import Layout from "./Layout.jsx";

import Home from "./Home";

import CreateRequest from "./CreateRequest";

import TravelerDashboard from "./TravelerDashboard";

import Dashboard from "./Dashboard";

import Chat from "./Chat";

import ChatList from "./ChatList";

import ChatRoom from "./ChatRoom";

import MyProfile from "./MyProfile";

import Admin from "./Admin";

import RequestToTraveler from "./RequestToTraveler";

import RequestDetail from "./RequestDetail";

import TravelerList from "./TravelerList";

import Wishlist from "./Wishlist";

import AllRequests from "./AllRequests";

import MyTransactions from "./MyTransactions";

import CustomerService from "./CustomerService";

import AdminAccess from "./AdminAccess";

import TravelVerification from "./TravelVerification";

import Community from "./Community";

import PostDetail from "./PostDetail";

import Events from "./Events";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    CreateRequest: CreateRequest,
    
    TravelerDashboard: TravelerDashboard,
    
    Dashboard: Dashboard,
    
    Chat: Chat,
    
    ChatList: ChatList,
    
    ChatRoom: ChatRoom,
    
    MyProfile: MyProfile,
    
    Admin: Admin,
    
    RequestToTraveler: RequestToTraveler,
    
    RequestDetail: RequestDetail,
    
    TravelerList: TravelerList,
    
    Wishlist: Wishlist,
    
    AllRequests: AllRequests,
    
    MyTransactions: MyTransactions,
    
    CustomerService: CustomerService,
    
    AdminAccess: AdminAccess,
    
    TravelVerification: TravelVerification,
    
    Community: Community,
    
    PostDetail: PostDetail,
    
    Events: Events,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/CreateRequest" element={<CreateRequest />} />
                
                <Route path="/TravelerDashboard" element={<TravelerDashboard />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Chat" element={<Chat />} />
                
                <Route path="/ChatList" element={<ChatList />} />
                
                <Route path="/ChatRoom" element={<ChatRoom />} />
                
                <Route path="/MyProfile" element={<MyProfile />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/RequestToTraveler" element={<RequestToTraveler />} />
                
                <Route path="/RequestDetail" element={<RequestDetail />} />
                
                <Route path="/TravelerList" element={<TravelerList />} />
                
                <Route path="/Wishlist" element={<Wishlist />} />
                
                <Route path="/AllRequests" element={<AllRequests />} />
                
                <Route path="/MyTransactions" element={<MyTransactions />} />
                
                <Route path="/CustomerService" element={<CustomerService />} />
                
                <Route path="/AdminAccess" element={<AdminAccess />} />
                
                <Route path="/TravelVerification" element={<TravelVerification />} />
                
                <Route path="/Community" element={<Community />} />
                
                <Route path="/PostDetail" element={<PostDetail />} />
                
                <Route path="/Events" element={<Events />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}