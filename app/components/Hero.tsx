import Link from 'next/link';

export default function Hero() {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Swim School Management
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            SwimTrackr is a comprehensive platform designed to digitize and centralize all aspects of swim school operations, making swim lesson management easier for everyone.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="bg-primary-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-primary-700">
              Get Started Free
            </Link>
            <Link href="/demo" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-50">
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 