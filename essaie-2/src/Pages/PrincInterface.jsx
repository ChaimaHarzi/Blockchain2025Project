/** @format */
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  User,
  LogOut,
  Wallet,
  Calendar,
  ChevronDown,
  Ticket,
  ArrowRightLeft,
  Plus,
} from "lucide-react";
import EventCard from "../components/EventCard";
import CreateEvent from "../components/CreateEvent";
import Marketplace from "./Marketplace";
import DetailsEvent from "../components/DetailsEvent";

const PrincInterface = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      name: "Concert Coldplay 2025",
      date: "21 Mars 2025",
      location: "Paris - Accor Arena",
      minPrice: 0.08,
      image:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
      description:
        "Experience an unforgettable night with Coldplay live in Paris. A spectacular show featuring their greatest hits and stunning visual effects.",
      ticketsAvailable: 234,
      totalTickets: 500,
      royalties: "5.0%",
      ticketCategories: [
        { type: "VIP", price: 0.12, quantity: 50 },
        { type: "Premium", price: 0.09, quantity: 80 },
        { type: "Standard", price: 0.08, quantity: 120 },
      ],
    },
    {
      id: 2,
      name: "Festival Summer Vibes",
      date: "10 Juillet 2025",
      location: "Nice - Beach Arena",
      minPrice: 0.05,
      image:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop",
      description:
        "Three days of non-stop music on the beach featuring top international DJs and artists.",
      ticketsAvailable: 1250,
      totalTickets: 2000,
      royalties: "5.0%",
      ticketCategories: [
        { type: "VIP", price: 0.09, quantity: 100 },
        { type: "Premium", price: 0.07, quantity: 350 },
        { type: "Standard", price: 0.05, quantity: 800 },
      ],
    },
    {
      id: 3,
      name: "Salon Tech Innov 2025",
      date: "5 Décembre 2025",
      location: "Berlin - Tech Expo",
      minPrice: 0.03,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      description:
        "Join the future of technology. Network with industry leaders and discover the latest innovations.",
      ticketsAvailable: 450,
      totalTickets: 800,
      royalties: "5.0%",
      ticketCategories: [
        { type: "VIP", price: 0.05, quantity: 80 },
        { type: "Premium", price: 0.04, quantity: 200 },
        { type: "Standard", price: 0.03, quantity: 170 },
      ],
    },
  ];

  const handleSignOut = () => {
    console.log("Sign out clicked");
  };

  const openDialog = (event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-slate-50 via-purple-50 to-blue-50'>
      {/* Navbar with glassmorphism effect */}
      <nav className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-linear-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30'>
                <Ticket className='w-5 h-5 text-white' />
              </div>
              <span className='text-xl font-bold bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'>
                NFT Ticketing
              </span>
            </div>

            {/* Navigation Menu */}
            <div className='flex items-center space-x-1'>
              <button
                onClick={() => navigate("/Marketplace")}
                className='flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all'>
                <ArrowRightLeft className='w-5 h-5' />
                <span className='font-medium hidden sm:inline'>
                  Marketplace
                </span>
              </button>

              {/* FILTER: All Events */}
              <button
                onClick={() => setEventFilter("all")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                  ${
                    eventFilter === "all"
                      ? "text-purple-600 bg-purple-100"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }
                `}>
                <Calendar className='w-5 h-5' />
                <span className='font-medium hidden sm:inline'>
                  Tous les événements
                </span>
              </button>

              {/* FILTER: My Events */}
              <button
                onClick={() => setEventFilter("mine")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                  ${
                    eventFilter === "mine"
                      ? "text-purple-600 bg-purple-100"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                  }
                `}>
                <User className='w-5 h-5' />
                <span className='font-medium hidden sm:inline'>
                  Mes événements
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className='relative ml-2'>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className='flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500'>
                  <div className='w-9 h-9 bg-linear-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg'>
                    <User className='w-5 h-5 text-white' />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50'>
                    <button
                      onClick={() => {
                        navigate("/wallet");
                        setIsDropdownOpen(false);
                      }}
                      className='w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors'>
                      <Wallet className='w-4 h-4' />
                      <span>Mon Wallet</span>
                    </button>
                    <button
                      onClick={handleSignOut}
                      className='w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors'>
                      <LogOut className='w-4 h-4' />
                      <span>Changer de Compte</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Events Section */}
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900'>
                Événements disponibles
              </h2>
              <p className='text-gray-600 mt-1'>
                Découvrez les prochains événements
              </p>
            </div>
            <button
              onClick={() => setShowCreateDialog(true)}
              className='flex items-center space-x-2 bg-linear-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 font-medium'>
              <Plus className='w-5 h-5' />
              <span>Créer un événement</span>
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {events
              .filter((event) => {
                if (eventFilter === "all") return true;
                return event.id === 1;
              })
              .map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpenDialog={openDialog}
                />
              ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateEvent
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      <DetailsEvent
        isOpen={isDialogOpen}
        event={selectedEvent}
        onClose={closeDialog}
      />
    </div>
  );
};

export default PrincInterface;
