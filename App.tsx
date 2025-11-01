import React, { useState, useEffect, FormEvent } from 'react';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';


// --- SVG Icon Components (existing) ---
const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" />
    </svg>
);
const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);
const RealEstateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636l1.5.545m9 0l-1.5-.545M12 21v-5.25c0-.621-.504-1.125-1.125-1.125H9.75c-.621 0-1.125.504-1.125 1.125V21" />
  </svg>
);
const EcommerceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.838-5.513a1.875 1.875 0 00-1.087-2.336H6.14M7.5 14.25L5.106 5.165A1.875 1.875 0 003.27 3.75H2.25m4.5 9h.008v.008h-.008v-.008zm5.25 0h.008v.008h-.008v-.008zm5.25 0h.008v.008h-.008v-.008z" />
  </svg>
);
const HealthcareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);
const EducationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);
const AutomotiveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-1.025H9.07a4.5 4.5 0 00-4.432 4.432V17.25a1.125 1.125 0 001.125 1.125h2.25" />
  </svg>
);
const RestaurantIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 8.25c0-3.866-3.134-7-7-7s-7 3.134-7 7c0 3.313 2.13 6.138 5 6.819V21a1 1 0 001 1h2a1 1 0 001-1v-5.931c2.87-.681 5-3.506 5-6.819zM9 8.25a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);
const AiIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);
const IntegrationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
  </svg>
);
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.485 13.85C34.643 10.32 29.643 8 24 8c-8.837 0-16 7.163-16 16s7.163 16 16 16c9.237 0 15.25-6.543 15.25-15.5c0-1.018-.106-2.02-.289-3.007l.024.007H43.611z"/>
        <path fill="#FF3D00" d="M6.306 14.691c-2.344 3.469-3.35 7.825-2.81 12.293l8.604-6.641l-4.043-3.111z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-4.819c-1.902 1.225-4.226 1.939-6.837 1.939c-4.4 0-8.233-2.286-10.42-5.636l-8.498 6.598C9.018 40.62 15.93 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083L43.595 20L36.62 20l.024.007c.205 1.05.31 2.12.31 3.233c0 4.156-1.58 7.893-4.113 10.669l6.237 4.852C42.844 35.132 44 30.076 44 24c0-1.582-.234-3.12-.65-4.582z"/>
    </svg>
);


// --- Page Section Components ---

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'pricing';

interface PageSetterProps {
    setPage: (page: Page) => void;
}

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
    setPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser } = useAuth();
    
    const handleLogout = async () => {
      await signOut(auth);
      setPage('landing');
    }

    const navLinks = currentUser 
      ? [{ name: 'Dashboard', page: 'dashboard' as Page }]
      : [
          { name: 'Features', page: 'landing' as Page, href: '#features' }, 
          { name: 'Use Cases', page: 'landing' as Page, href: '#use-cases' }, 
          { name: 'Pricing', page: 'pricing' as Page },
        ];

    const handleNavClick = (page: Page) => {
        setPage(page);
        setIsMenuOpen(false);
    }

    return (
        <header className="bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a onClick={() => handleNavClick('landing')} className="text-2xl font-bold cursor-pointer">AutoCall Pro</a>
                
                <nav className="hidden md:flex items-center space-x-8">
                    {navLinks.map(link => (
                       <a key={link.name} onClick={() => handleNavClick(link.page)} href={link.href || '#'} className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors duration-300 cursor-pointer">{link.name}</a>
                    ))}

                    {currentUser ? (
                        <button onClick={handleLogout} className="bg-black text-white font-semibold px-5 py-2 rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-300">
                            Logout
                        </button>
                    ) : (
                        <>
                            <button onClick={() => handleNavClick('login')} className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors duration-300 font-semibold">Login</button>
                            <button onClick={() => handleNavClick('signup')} className="bg-black text-white font-semibold px-5 py-2 rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-300">
                                Get Started
                            </button>
                        </>
                    )}
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300" aria-label="Toggle theme">
                        {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                    </button>
                </nav>
                <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                    {isMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                </button>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-6 py-4 flex flex-col space-y-4 items-center">
                        {navLinks.map(link => (
                            <a key={link.name} onClick={() => handleNavClick(link.page)} href={link.href || '#'} className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors duration-300 text-center">{link.name}</a>
                        ))}
                         {currentUser ? (
                            <button onClick={handleLogout} className="bg-black text-white font-semibold px-5 py-2 rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-300 text-center w-full">
                                Logout
                            </button>
                        ) : (
                            <>
                                <button onClick={() => handleNavClick('login')} className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors duration-300 text-center w-full py-2">Login</button>
                                <button onClick={() => handleNavClick('signup')} className="bg-black text-white font-semibold px-5 py-2 rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-300 text-center w-full">
                                    Get Started
                                </button>
                            </>
                        )}
                         <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 mt-4" aria-label="Toggle theme">
                            {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

const Hero: React.FC<PageSetterProps> = ({ setPage }) => {
    return (
        <section className="text-black dark:text-white py-20 md:py-32">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
                    Automated Call System for Every Business
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                    Transform your customer engagement with intelligent automated calling solutions. From real estate to retail, streamline your operations and boost conversions.
                </p>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => setPage('signup')} className="bg-black text-white font-semibold px-8 py-3 rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-300">
                        Start Free Trial
                    </button>
                    <a href="#" className="bg-gray-100 text-black font-semibold px-8 py-3 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300">
                        View Demo
                    </a>
                </div>
                <div className="mt-16 mx-auto max-w-5xl">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-gray-400/20 dark:shadow-gray-900/50 overflow-hidden">
                    <img src="https://picsum.photos/seed/autocall/1200/675" alt="Automated Call System Dashboard" className="w-full h-full object-cover"/>
                  </div>
                </div>
            </div>
        </section>
    );
};

const useCasesData = [
    { icon: RealEstateIcon, title: "Real Estate", description: "Automate property inquiries, schedule viewings, and provide financing information to potential buyers.", points: ["Property search automation", "Viewing appointments", "Financing assistance"] },
    { icon: EcommerceIcon, title: "E-commerce", description: "Follow up on abandoned carts, provide product recommendations, and handle customer support calls.", points: ["Cart recovery calls", "Product recommendations", "Order status updates"] },
    { icon: HealthcareIcon, title: "Healthcare", description: "Automate appointment reminders, prescription refills, and health screening follow-ups.", points: ["Appointment reminders", "Prescription alerts", "Health check follow-ups"] },
    { icon: EducationIcon, title: "Education", description: "Handle admissions inquiries, course information, and enrollment assistance automatically.", points: ["Admissions support", "Course information", "Enrollment assistance"] },
    { icon: AutomotiveIcon, title: "Automotive", description: "Automate service reminders, test drive scheduling, and vehicle inquiry responses.", points: ["Service reminders", "Test drive booking", "Vehicle inquiries"] },
    { icon: RestaurantIcon, title: "Restaurants", description: "Handle reservation requests, takeout orders, and customer feedback collection automatically.", points: ["Reservation management", "Order processing", "Feedback collection"] }
];

const UseCases: React.FC = () => (
    <section id="use-cases" className="py-20 bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Use Cases Across Industries</h2>
                <p className="text-gray-600 dark:text-gray-400">Discover how our automated call system transforms business operations across different sectors.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {useCasesData.map(item => (
                    <div key={item.title} className="bg-white dark:bg-black p-8 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center mb-4"><item.icon className="w-8 h-8 mr-4 text-gray-700 dark:text-gray-300" /><h3 className="text-xl font-semibold">{item.title}</h3></div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                        <ul className="space-y-2">{item.points.map(point => (<li key={point} className="flex items-start text-gray-700 dark:text-gray-300"><span className="text-gray-400 dark:text-gray-500 mr-2">•</span>{point}</li>))}</ul>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const featuresData = [
  { icon: AiIcon, title: "AI-Powered", description: "Smart conversation flows that adapt to customer responses." },
  { icon: ClockIcon, title: "24/7 Availability", description: "Never miss a customer inquiry with round-the-clock service." },
  { icon: ChartIcon, title: "Analytics", description: "Detailed insights into call performance and customer behavior." },
  { icon: IntegrationIcon, title: "Easy Integration", description: "Seamlessly integrate with your existing CRM and tools." }
];

const Features: React.FC = () => (
    <section id="features" className="py-20 text-black dark:text-white">
        <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose AutoCall Pro?</h2>
                <p className="text-gray-600 dark:text-gray-400">Advanced features designed to enhance customer experience and streamline your operations.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuresData.map(feature => (
                    <div key={feature.title} className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg text-center border border-gray-200 dark:border-gray-800">
                        <div className="flex justify-center mb-4"><div className="bg-white dark:bg-black rounded-full p-4 border border-gray-200 dark:border-gray-700"><feature.icon className="w-8 h-8 text-black dark:text-white"/></div></div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const CTA: React.FC<PageSetterProps> = ({ setPage }) => (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 text-black dark:text-white">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Customer Engagement?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">Join thousands of businesses already using AutoCall Pro to boost their conversions and customer satisfaction.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button onClick={() => setPage('signup')} className="bg-black text-white font-semibold px-8 py-3 rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-300">Start Free Trial</button>
                <a href="#" className="bg-gray-200 text-black font-semibold px-8 py-3 rounded-md hover:bg-gray-300 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300">Schedule Demo</a>
            </div>
        </div>
    </section>
);

const Footer: React.FC<PageSetterProps> = ({ setPage }) => {
    const footerLinks = { Product: ["Features", "Pricing", "Integrations", "API"], Company: ["About", "Careers", "Press", "Contact"], Support: ["Help Center", "Documentation", "Status", "Community"] };
    return (
        <footer className="py-16 text-gray-600 dark:text-gray-400">
            <div className="container mx-auto px-6"><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12"><div className="md:col-span-2 lg:col-span-1"><h3 className="text-black dark:text-white text-xl font-bold mb-2">AutoCall Pro</h3><p className="max-w-xs">Revolutionizing customer engagement through intelligent automated calling solutions.</p></div>{Object.entries(footerLinks).map(([title, links]) => (<div key={title}><h4 className="font-semibold text-black dark:text-white mb-4">{title}</h4><ul className="space-y-3">{links.map(link => (<li key={link}>{ link === 'Pricing' ? <button onClick={() => setPage('pricing')} className="hover:text-black dark:hover:text-white transition-colors duration-300 text-left">{link}</button> : <a href="#" className="hover:text-black dark:hover:text-white transition-colors duration-300">{link}</a> }</li>))}</ul></div>))}<div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm"><p>&copy; {new Date().getFullYear()} AutoCall Pro. All rights reserved.</p></div></div></div>
        </footer>
    );
};

// --- Landing Page Wrapper ---
const LandingPage: React.FC<PageSetterProps> = ({ setPage }) => (
    <>
        <Hero setPage={setPage} />
        <UseCases />
        <Features />
        <CTA setPage={setPage} />
    </>
);

// --- Pricing Page Component ---
const pricingPlans = [
    {
        name: 'Starter',
        priceMonthly: 49,
        priceAnnually: 490,
        description: 'For individuals and small teams getting started.',
        features: [
            '100 credits per month',
            'AI-powered conversations',
            'Basic analytics',
            'Email support',
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Pro',
        priceMonthly: 99,
        priceAnnually: 990,
        description: 'For growing businesses that need more power and flexibility.',
        features: [
            '500 credits per month',
            'Everything in Starter',
            'Advanced analytics & reporting',
            'CRM integrations',
            'Priority support',
        ],
        cta: 'Get Started',
        popular: true,
    },
    {
        name: 'Enterprise',
        priceMonthly: 'Custom',
        priceAnnually: 'Custom',
        description: 'For large organizations with custom needs.',
        features: [
            'Unlimited credits',
            'Everything in Pro',
            'Dedicated account manager',
            'Custom integrations & API access',
            '24/7 premium support',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

const faqs = [
    {
        question: 'What are credits and how are they used?',
        answer: 'One credit is used for each successful automated call placed through our system, regardless of the duration. You can purchase more credits if you run out.',
    },
    {
        question: 'Can I change my plan later?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time from your account dashboard. Changes will be prorated.',
    },
    {
        question: 'What happens if I go over my monthly credit limit?',
        answer: 'If you exceed your monthly credit limit, you have the option to purchase additional credits on a pay-as-you-go basis or upgrade to a higher plan.',
    },
    {
        question: 'Do you offer a free trial?',
        answer: 'Yes, every new account starts with 5 free credits to test our service. No credit card is required to sign up and try it out.',
    },
];


const PricingPage: React.FC<PageSetterProps> = ({ setPage }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    return (
        <section id="pricing" className="py-20 text-black dark:text-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Pricing Plans for Every Business</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Choose the perfect plan to automate your calls and boost your customer engagement.</p>
                </div>

                <div className="flex justify-center items-center space-x-4 mb-12">
                    <span className={`font-medium ${billingCycle === 'monthly' ? 'text-black dark:text-white' : 'text-gray-500'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-200 dark:bg-gray-700"
                        aria-label="Toggle billing cycle"
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-black transition-transform ${billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`font-medium ${billingCycle === 'annually' ? 'text-black dark:text-white' : 'text-gray-500'}`}>
                        Annually <span className="text-sm text-green-500">(Save 20%)</span>
                    </span>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {pricingPlans.map(plan => (
                        <div key={plan.name} className={`relative flex flex-col p-8 rounded-2xl border ${plan.popular ? 'border-black dark:border-white' : 'border-gray-200 dark:border-gray-800'} bg-white dark:bg-black`}>
                            {plan.popular && <div className="absolute top-0 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-sm font-semibold rounded-full self-center">Most Popular</div>}
                            <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">{plan.description}</p>
                            
                            <div className="mb-6">
                                {/* FIX: Add type guard to ensure priceAnnually is a number before division */}
                                {typeof plan.priceMonthly === 'number' && typeof plan.priceAnnually === 'number' ? (
                                    <>
                                        <span className="text-5xl font-extrabold">
                                            ${billingCycle === 'monthly' ? plan.priceMonthly : Math.floor(plan.priceAnnually / 12)}
                                        </span>
                                        <span className="text-lg font-medium text-gray-500 dark:text-gray-400">/mo</span>
                                        {billingCycle === 'annually' && <p className="text-sm text-gray-500">Billed as ${plan.priceAnnually} per year</p>}
                                    </>
                                ) : (
                                    <span className="text-4xl font-extrabold">{plan.priceMonthly}</span>
                                )}
                            </div>

                            <button
                                onClick={() => setPage('signup')}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${plan.popular ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200' : 'bg-gray-100 text-black hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'}`}
                            >
                                {plan.cta}
                            </button>
                            
                            <ul className="space-y-4 mt-8 text-gray-700 dark:text-gray-300">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <CheckIcon className="h-5 w-5 mr-3 mt-0.5 text-black dark:text-white flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-20 max-w-4xl mx-auto">
                    <h3 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h3>
                    <div className="space-y-6">
                        {faqs.map(faq => (
                            <div key={faq.question} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <h4 className="font-semibold text-lg mb-2">{faq.question}</h4>
                                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};


// --- Auth Form Component ---
interface AuthFormProps {
    isSignUp: boolean;
    setPage: (page: Page) => void;
}
const AuthForm: React.FC<AuthFormProps> = ({ isSignUp, setPage }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [countryCode, setCountryCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const countryCodes = [
      { code: '+1', country: 'USA/CAN' },
      { code: '+44', country: 'UK' },
      { code: '+91', country: 'India' },
      { code: '+61', country: 'Australia' },
      { code: '+81', country: 'Japan' },
      { code: '+49', country: 'Germany' },
    ];
    
    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/\D/g, '');
        if (numericValue.length <= 10) {
            setPhoneNumber(numericValue);
            if (phoneError && numericValue.length === 10) {
                setPhoneError('');
            }
        }
    };
    
    const validatePhoneNumber = (): boolean => {
        if (!isSignUp) return true; // Only validate for signup
        if (!phoneNumber.trim()) {
            setPhoneError('Phone number is required for signup.');
            return false;
        }
        if (!/^\d{10}$/.test(phoneNumber)) {
            setPhoneError('Please enter a valid 10-digit phone number.');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setErrorMessage('');
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Check if user exists in Firestore, if not, create a new document
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                 await setDoc(userDocRef, {
                    name: user.displayName,
                    email: user.email,
                    credits: 5,
                    createdAt: new Date(),
                });
            }
            // onAuthStateChanged in AuthContext will handle redirect
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                setErrorMessage('Failed to sign in with Google. Please try again.');
                console.error('Google Sign-In error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSignUp && !validatePhoneNumber()) {
            return;
        }
        setLoading(true);
        setErrorMessage('');
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    name: fullName,
                    email: userCredential.user.email,
                    phoneNumber: `${countryCode}${phoneNumber}`,
                    credits: 5,
                    createdAt: new Date(),
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            // onAuthStateChanged in AuthContext will handle redirect
        } catch (error: any) {
             switch (error.code) {
                case 'auth/email-already-in-use':
                    setErrorMessage('This email is already registered. Please log in.');
                    break;
                case 'auth/invalid-credential':
                     setErrorMessage('Invalid email or password. Please try again.');
                     break;
                case 'auth/weak-password':
                    setErrorMessage('Password is too weak. It should be at least 6 characters.');
                    break;
                default:
                    setErrorMessage('An unexpected error occurred. Please try again.');
                    console.error('Authentication error:', error);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isSignUp ? 'Already have an account? ' : 'New to AutoCall Pro? '}
                        <button onClick={() => setPage(isSignUp ? 'login' : 'signup')} className="font-medium text-black dark:text-white hover:underline">
                            {isSignUp ? 'Sign in' : 'Create an account'}
                        </button>
                    </p>
                </div>

                <div>
                    <button 
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                        <GoogleIcon className="h-5 w-5 mr-2" />
                        Continue with Google
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                            OR
                        </span>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {isSignUp && (
                        <div>
                            <label htmlFor="full-name" className="sr-only">Full name</label>
                            <input id="full-name" name="name" type="text" autoComplete="name" required value={fullName} onChange={e => setFullName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-500"
                                placeholder="Full name" />
                        </div>
                    )}
                    
                    {isSignUp && (
                         <div>
                            <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                            <div className="flex">
                                <select
                                    id="countryCode" name="countryCode" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white" aria-label="Country Code">
                                    {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                                <input type="tel" id="phoneNumber" name="phoneNumber" value={phoneNumber} onChange={handlePhoneNumberChange} onBlur={validatePhoneNumber} placeholder="Phone number"
                                className={`w-full px-4 py-2 border rounded-r-md focus:ring-2 dark:bg-gray-800 dark:text-white placeholder-gray-500 ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-black'}`}
                                required aria-invalid={!!phoneError} aria-describedby="phone-error" />
                            </div>
                            {phoneError && <p id="phone-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{phoneError}</p>}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-500"
                            placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-500"
                            placeholder="Password" />
                    </div>

                    {errorMessage && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 dark:bg-red-900/30 dark:text-red-300 dark:border-red-400" role="alert">
                            <p>{errorMessage}</p>
                        </div>
                    )}

                    <div>
                        <button type="submit" disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50">
                            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign in')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- App Content Component ---
const AppContent: React.FC = () => {
  const [theme, setTheme] = useState('light');
  const [page, setPage] = useState<Page>('landing');
  const { currentUser, loading: loadingAuth } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) setTheme(savedTheme);
    else if (prefersDark) setTheme('dark');
  }, []);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  // Effect for handling page navigation based on auth state
  useEffect(() => {
    if (!loadingAuth) {
      if (currentUser) {
        if (page !== 'dashboard') {
            setPage('dashboard');
        }
      } else {
        if (page === 'dashboard') {
          setPage('landing');
        }
      }
    }
  }, [currentUser, loadingAuth, page]);


  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const renderPage = () => {
      if(loadingAuth) {
          return <div className="text-center py-20 text-black dark:text-white">Loading...</div>
      }
      
      switch(page) {
          case 'login':
              return <AuthForm isSignUp={false} setPage={setPage} />;
          case 'signup':
              return <AuthForm isSignUp={true} setPage={setPage} />;
          case 'dashboard':
              return currentUser ? <Dashboard /> : <AuthForm isSignUp={false} setPage={setPage} />;
          case 'pricing':
              return <PricingPage setPage={setPage} />;
          case 'landing':
          default:
              return <LandingPage setPage={setPage} />;
      }
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen font-sans transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} setPage={setPage} />
      <main>
        {renderPage()}
      </main>
      {(page === 'landing' || page === 'pricing') && <Footer setPage={setPage} />}
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;