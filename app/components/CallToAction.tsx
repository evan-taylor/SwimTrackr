import Link from 'next/link';

export default function CallToAction() {
  return (
    <div className="bg-primary-600 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Swim School Management?
        </h2>
        <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
          Join thousands of swim schools and parents who are simplifying their swim management and tracking with SwimTrackr.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/register/school" 
            className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-md text-lg font-medium"
          >
            Sign Up as a Facility
          </Link>
          <Link 
            href="/register/parent" 
            className="bg-primary-700 text-white hover:bg-primary-800 px-8 py-3 rounded-md text-lg font-medium"
          >
            Sign Up as a Parent
          </Link>
        </div>
      </div>
    </div>
  );
} 