import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';

// Force dynamic rendering for cookie access
export const dynamic = 'force-dynamic';

export default async function Home() {
  const userData = await getUser();
  
  // If logged in, redirect to dashboard
  if (userData) {
    redirect('/dashboard');
  }
  
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/85 backdrop-blur-sm border-b border-blue-100/50 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="/SwimTrackr-Logo.png" 
              alt="SwimTrackr Logo" 
              width={150} 
              height={40}
              className="h-auto transition-transform hover:scale-110 duration-300" 
            />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="hidden sm:inline-block px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:py-40 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute w-[600px] h-[600px] -right-64 -top-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute w-[500px] h-[500px] -bottom-64 -left-40 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-blue-200 rounded-full filter blur-xl opacity-50 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-cyan-200 rounded-full filter blur-xl opacity-50 animate-float animation-delay-500"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight animate-fade-in">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Transform
              </span>
              <br />
              <span className="text-gray-900">Your Swim School</span>
            </h1>
            <p className="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto animate-fade-in animation-delay-500">
              The intelligent platform revolutionizing how swim schools operate.
              Track progress, manage classes, and provide a superior experience for students
              and instructors alike.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in animation-delay-1000">
              <Link
                href="/auth/register"
                className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto flex justify-center items-center gap-2 animate-pulse-blue"
              >
                Get Started Free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 text-lg font-medium text-blue-600 border border-blue-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 w-full sm:w-auto flex justify-center items-center gap-2"
              >
                See How It Works
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden border border-blue-100 perspective animate-fade-in animation-delay-1500">
            <div className="relative card-3d">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
              <Image
                src="/SwimTrackr-Box-Logo.png"
                alt="SwimTrackr Dashboard Preview"
                width={1200}
                height={675}
                className="w-full h-auto"
              />
              {/* Floating elements on the image */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform hover-lift animate-float animation-delay-1000">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-800">Live Updates</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg transform hover-lift animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-gray-800">Smart Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to revolutionize your swim school operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Smart Session Management</h3>
              <p className="text-gray-600">
                Intelligent scheduling and attendance tracking for optimized class management. Never double-book instructors or pools again.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Progress Analytics</h3>
              <p className="text-gray-600">
                Advanced tracking and reporting for student skill development. Visualize improvement and identify areas needing attention.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
                <svg className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">Parent Portal</h3>
              <p className="text-gray-600">
                Give parents real-time visibility into their child's progress, upcoming classes, and achievement milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Replace Testimonials with Coming Soon Features */}
      <section id="testimonials" className="py-20 md:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're working hard to bring you these exciting features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Scheduling</h3>
              <p className="text-gray-600">
                Intelligent scheduling system with drag-and-drop interface, conflict detection, and automated reminders for students and instructors.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Coming Q3 2023</span>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Skill Achievement Badges</h3>
              <p className="text-gray-600">
                Digital achievement system with customizable skill badges, progress visualization, and shareable accomplishments for student motivation.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Coming Q4 2023</span>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Integrated Payments</h3>
              <p className="text-gray-600">
                Secure payment processing for memberships, single classes, and packages with automated billing, invoicing, and financial reporting.
              </p>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Coming Q1 2024</span>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              SwimTrackr is under active development. We're building these features based on feedback from swim schools like yours.
            </p>
            <Link 
              href="/auth/register" 
              className="inline-flex items-center px-6 py-3 bg-white border border-blue-200 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <span>Join our beta program</span>
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Swim School?</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join hundreds of swim schools already using SwimTrackr to improve their operations,
              enhance student experience, and grow their business.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto transform hover:-translate-y-1 duration-300"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 text-lg font-medium text-blue-600 border border-blue-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all w-full sm:w-auto transform hover:-translate-y-1 duration-300"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-100">
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
              <a href="#features" className="text-gray-500 hover:text-blue-600 transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-500 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Terms</a>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482A13.978 13.978 0 011.64 3.162a4.92 4.92 0 001.522 6.574 4.9 4.9 0 01-2.23-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.9 13.9 0 007.548 2.209c9.054 0 14-7.497 14-13.987 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59l-.047-.02z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-gray-500 text-sm mt-8">
            <p>&copy; {new Date().getFullYear()} SwimTrackr. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 