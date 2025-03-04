'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function TermsPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-md' 
          : 'py-5 bg-transparent'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/SwimTrackr-Logo.png" 
              alt="SwimTrackr Logo" 
              width={150} 
              height={40}
              className="h-auto transition-transform hover:scale-110 duration-300" 
              priority
            />
          </Link>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</Link>
              <Link href="/#waitlist" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Join Waitlist</Link>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-grow pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="relative mb-10">
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-md opacity-70"></div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-100 dark:bg-cyan-900/40 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-md opacity-70"></div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 relative z-10">Terms of Service</h1>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 relative z-10">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto"></div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">1. Introduction</h2>
                <p>Welcome to SwimTrackr! These Terms of Service govern your use of our website and services. By accessing or using SwimTrackr, you agree to be bound by these terms.</p>
                <p>Our platform aims to revolutionize how swim schools operate with intelligent progress tracking, streamlined class management, and powerful analytics.</p>
              </section>

              <section className="mb-10 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">2. Using Our Services</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">A</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Account Creation</h3>
                      <p className="text-gray-600 dark:text-gray-300">You must provide accurate information when registering for a SwimTrackr account. You are responsible for maintaining the security of your account credentials.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">B</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Service Usage</h3>
                      <p className="text-gray-600 dark:text-gray-300">Our services are designed to help swim schools manage their operations. You agree to use the services only for their intended purposes and in compliance with applicable laws.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">3. Privacy</h2>
                <p>Your privacy is important to us. Our <Link href="/privacy" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">Privacy Policy</Link> explains how we collect, use, and protect your personal information.</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">4. Content and Intellectual Property</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-2">Your Content</h3>
                    <p className="text-gray-600 dark:text-gray-300">You retain ownership of any content you create, share, or upload to our platform.</p>
                  </div>
                  <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 p-5 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-2">Our Content</h3>
                    <p className="text-gray-600 dark:text-gray-300">SwimTrackr owns all intellectual property rights to our platform, branding, and original content.</p>
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">5. Termination</h2>
                <p>We may suspend or terminate your access to SwimTrackr at our discretion, particularly if we determine you have violated these Terms of Service.</p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">6. Disclaimer of Warranties</h2>
                <p>SwimTrackr services are provided "as is" without warranties of any kind, whether express or implied.</p>
              </section>

              <div className="my-12 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <h2 className="text-2xl font-semibold mb-4 text-center">Have Questions?</h2>
                <p className="text-center mb-6">If you have any questions about our Terms of Service, please contact us.</p>
                <div className="flex justify-center">
                  <Link href="mailto:support@swimtrackr.app" className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-full transition-all shadow-md hover:shadow-lg">
                    Contact Support
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-12 border-t border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Link href="/">
                <Image 
                  src="/SwimTrackr-Logo.png" 
                  alt="SwimTrackr Logo" 
                  width={120} 
                  height={32} 
                  className="h-auto"
                />
              </Link>
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
  );
} 