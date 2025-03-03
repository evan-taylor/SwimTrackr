import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export default async function Home() {
  const userData = await getUser();
  
  // If logged in, redirect to dashboard
  if (userData) {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="SwimTrackr Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SwimTrackr
            </h1>
          </div>
        </div>
      </header>
      
      <main className="flex-grow pt-20">
        {/* Hero section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  The Future of
                </span>
                <br />
                <span className="text-gray-900">Swim School Management</span>
              </h1>
              <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                A revolutionary platform transforming how swim schools operate. 
                Seamlessly manage sessions, track progress, and enhance the learning experience.
              </p>
              <div className="mt-12">
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Discover Features
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section */}
        <section id="features" className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to revolutionize your swim school operations
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature cards */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Session Management</h3>
                <p className="text-gray-600">
                  Intelligent scheduling and attendance tracking for optimized class management.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Analytics</h3>
                <p className="text-gray-600">
                  Advanced tracking and reporting for student skill development and achievements.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Instructor Dashboard</h3>
                <p className="text-gray-600">
                  Comprehensive tools for instructors to manage classes and student progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Coming Soon</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're working hard to bring you the most advanced swim school management platform. 
              Stay tuned for updates!
            </p>
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.svg"
                alt="SwimTrackr Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                SwimTrackr
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SwimTrackr. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 