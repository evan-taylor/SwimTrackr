'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/app/components/ThemeToggle';
import WaitlistForm from '@/app/components/WaitlistForm';
import { Metadata } from 'next';
import Script from 'next/script';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// For structured data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SwimTrackr",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/ComingSoon"
  },
  "description": "SwimTrackr is revolutionizing how swim schools operate with intelligent progress tracking, streamlined class management, and powerful analytics.",
  "featureList": "Smart Session Management, Progress Analytics, Parent Portal"
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({
    features: false,
    feature1: false,
    feature2: false,
    feature3: false,
    waitlist: false
  });

  // Handle scroll effect for header and scroll animations
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Check visibility of sections for animations
      const sections = {
        features: document.getElementById('features'),
        feature1: document.querySelector('[data-feature="1"]'),
        feature2: document.querySelector('[data-feature="2"]'),
        feature3: document.querySelector('[data-feature="3"]'),
        waitlist: document.getElementById('waitlist')
      };
      
      Object.entries(sections).forEach(([key, section]) => {
        if (!section) return;
        
        const rect = section.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
        
        setIsVisible(prev => ({
          ...prev,
          [key]: isInView
        }));
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Structured data for SEO */}
      <Script id="structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      
      <div className="flex flex-col min-h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Header */}
        <header className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'py-3 bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-md' 
            : 'py-5 bg-transparent'
        }`}>
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image 
                src="/SwimTrackr-Logo.png" 
                alt="SwimTrackr Logo" 
                width={150} 
                height={40}
                className="h-auto transition-transform hover:scale-110 duration-300" 
                priority
              />
            </div>
            <div className="flex items-center gap-8">
              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
                <a href="#waitlist" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Join Waitlist</a>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen pt-32 lg:pt-40 pb-20 md:pb-32 overflow-hidden flex items-center">
          {/* Animated background elements with higher quality blur effects */}
          <div className="absolute w-[700px] h-[700px] -right-64 -top-64 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute w-[600px] h-[600px] -bottom-64 -left-40 bg-gradient-to-tr from-cyan-100 to-sky-50 dark:from-cyan-900/30 dark:to-sky-800/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/4 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-200 to-blue-100 dark:from-blue-600/40 dark:to-blue-500/30 rounded-full filter blur-xl opacity-50 animate-float animation-delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-gradient-to-tr from-cyan-200 to-sky-100 dark:from-cyan-600/40 dark:to-sky-500/30 rounded-full filter blur-xl opacity-50 animate-float animation-delay-500"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight animate-fade-in">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  Reimagine
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">Swim School Management</span>
              </h1>
              <p className="mt-8 text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto animate-fade-in animation-delay-500 font-light">
                SwimTrackr is revolutionizing how swim schools operate with intelligent progress tracking, 
                streamlined class management, and powerful analytics.
              </p>
              <div className="mt-12 flex justify-center items-center animate-fade-in animation-delay-1000">
                <a
                  href="#waitlist"
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 dark:from-blue-500 dark:to-cyan-400 dark:hover:from-blue-600 dark:hover:to-cyan-500 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  aria-label="Join our waitlist"
                >
                  Join the Waitlist
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Hero decorative elements */}
          <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-0"></div>
        </section>

        {/* Features Section */}
        <section 
          id="features" 
          className={`py-20 md:py-32 bg-white dark:bg-gray-900 transition-all duration-700 ${isVisible.features ? 'opacity-100' : 'opacity-0 transform translate-y-10'}`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <span className="inline-block text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-wider uppercase mb-2">Powerful Toolkit</span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Streamline Your Operations</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light">
                Everything you need to revolutionize your swim school experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Feature 1 */}
              <div 
                data-feature="1"
                className={`bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group ${isVisible.feature1 ? 'opacity-100' : 'opacity-0 transform translate-y-10'}`}
                style={{ transitionDelay: '100ms' }}
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors duration-500">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Smart Session Management</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Intelligent scheduling and attendance tracking for optimized class management. Never double-book instructors or pools again.
                </p>
              </div>

              {/* Feature 2 */}
              <div 
                data-feature="2"
                className={`bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group ${isVisible.feature2 ? 'opacity-100' : 'opacity-0 transform translate-y-10'}`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors duration-500">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Progress Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Advanced tracking and reporting for student skill development. Visualize improvement and identify areas needing attention.
                </p>
              </div>

              {/* Feature 3 */}
              <div 
                data-feature="3"
                className={`bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group ${isVisible.feature3 ? 'opacity-100' : 'opacity-0 transform translate-y-10'}`}
                style={{ transitionDelay: '500ms' }}
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors duration-500">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Parent Portal</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Give parents real-time visibility into their child's progress, upcoming classes, and achievement milestones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section with refined design */}
        <section 
          id="waitlist" 
          className={`py-20 md:py-32 bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-700 ${isVisible.waitlist ? 'opacity-100' : 'opacity-0 transform translate-y-10'}`}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-wider uppercase mb-2">Early Access</span>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Join Our Waitlist</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light">
                  Be among the first to experience SwimTrackr when we launch. Sign up now to secure your spot.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </section>

        {/* Footer with modern styling */}
        <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-12 border-t border-gray-100 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Image 
                  src="/SwimTrackr-Logo.png" 
                  alt="SwimTrackr Logo" 
                  width={120} 
                  height={32} 
                  className="h-auto"
                />
              </div>
              <div className="flex gap-8">
                <Link href="/#features" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link>
                <Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy</Link>
                <Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</Link>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <a href="#" aria-label="Facebook" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="https://x.com/SwimTrackr" aria-label="Twitter" className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482A13.978 13.978 0 011.64 3.162a4.92 4.92 0 001.522 6.574 4.9 4.9 0 01-2.23-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.9 13.9 0 007.548 2.209c9.054 0 14-7.497 14-13.987 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59l-.047-.02z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
              <p>&copy; {new Date().getFullYear()} SwimTrackr. All rights reserved.</p>
              <p>2261 Market Street #86329<br/>San Francisco, CA 94114</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 