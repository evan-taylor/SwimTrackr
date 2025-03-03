import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          SwimTrackr
        </Link>
        <div className="space-x-4">
          <Link href="/about" className="text-gray-600 hover:text-primary-600">
            About
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-primary-600">
            Pricing
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-primary-600">
            Contact
          </Link>
          <Link href="/login" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
} 