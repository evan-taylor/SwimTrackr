'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/app/components/ThemeToggle';

export default function PrivacyPage() {
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
            {/* Floating decorative elements */}
            <div className="absolute top-40 right-10 w-16 h-16 bg-blue-200 dark:bg-blue-600/30 rounded-full filter blur-xl opacity-30 animate-float"></div>
            <div className="absolute bottom-20 left-10 w-20 h-20 bg-cyan-200 dark:bg-cyan-600/30 rounded-full filter blur-xl opacity-30 animate-float animation-delay-1000"></div>
            
            <div className="relative mb-10">
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-md opacity-70"></div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-100 dark:bg-cyan-900/40 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-md opacity-70"></div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 relative z-10">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6 relative z-10">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto"></div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              At SwimTrackr, we take your privacy seriously. This policy explains how we collect, use, and protect your information.
            </p>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Information We Collect</h2>
                </div>
                
                <div className="ml-16 space-y-4">
                  <div className="p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl shadow">
                    <h3 className="text-xl font-medium mb-3">Personal Information</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We collect information that you provide directly to us, such as when you create an account, fill out a form, or communicate with us. This may include:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mt-3 space-y-1">
                      <li>Name and contact details</li>
                      <li>Account credentials</li>
                      <li>Billing information</li>
                      <li>Communication preferences</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl shadow">
                    <h3 className="text-xl font-medium mb-3">Usage Information</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We collect information about how you interact with our services, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mt-3 space-y-1">
                      <li>Access times and pages viewed</li>
                      <li>Your device and browser information</li>
                      <li>IP address and general location</li>
                      <li>Features you use within our platform</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">How We Use Your Information</h2>
                </div>
                
                <div className="ml-16 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col bg-white dark:bg-gray-700 p-6 rounded-xl shadow">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Service Delivery</span>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">To provide and maintain our services, process transactions, and send service communications.</p>
                    </div>
                    <div className="flex flex-col bg-white dark:bg-gray-700 p-6 rounded-xl shadow">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Improvement</span>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">To understand how users interact with our platform and improve our features and functionality.</p>
                    </div>
                    <div className="flex flex-col bg-white dark:bg-gray-700 p-6 rounded-xl shadow">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Communication</span>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">To respond to your inquiries, provide support, and send updates about our services.</p>
                    </div>
                    <div className="flex flex-col bg-white dark:bg-gray-700 p-6 rounded-xl shadow">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">Security</span>
                      <p className="text-gray-600 dark:text-gray-300 flex-grow">To protect our services, users, and others from fraud, security threats, and abuse.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">How We Protect Your Information</h2>
                </div>
                
                <div className="ml-16">
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      We implement a variety of security measures to protect your information:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">Encryption of sensitive data both in transit and at rest</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">Regular security assessments and testing of our systems</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">Access controls to limit employee access to your information</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-600 dark:text-gray-300">Continuous monitoring for unusual activity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Your Choices and Rights</h2>
                </div>
                
                <div className="ml-16">
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You have several rights regarding your personal information:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <h3 className="font-medium">Access</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">You can request access to the personal information we have about you.</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <h3 className="font-medium">Correction</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">You can request correction of your personal information if it's inaccurate.</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <h3 className="font-medium">Deletion</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">You can request deletion of your personal information in certain circumstances.</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      <h3 className="font-medium">Restriction</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">You can request restriction of processing of your personal information.</p>
                    </div>
                  </div>
                </div>
              </section>
              
              <div className="my-12 p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <h2 className="text-2xl font-semibold mb-4 text-center">Questions About Privacy?</h2>
                <p className="text-center mb-6">If you have any questions about our Privacy Policy, please contact us.</p>
                <div className="flex justify-center">
                  <Link href="mailto:support@swimtrackr.app" className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-full transition-all shadow-md hover:shadow-lg">
                    Contact Privacy Team
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