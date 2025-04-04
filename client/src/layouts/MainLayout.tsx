import { useState } from "react";
import { Link } from "wouter";

// Type for user data
type User = {
  id: number;
  username: string;
  role: "admin" | "wholesaler";
};

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Mock user for testing (set to null for unauthenticated state)
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = () => {
    // For now just log to console
    console.log("Logout clicked");
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.92 11H18V13H13.92C13.8 13.84 13.4 14.59 12.79 15.17C12.19 15.79 11.41 16.13 10.54 16.13C9.46 16.13 8.53 15.67 7.92 14.92C7.33 14.21 7 13.39 7 12.46C7 11.54 7.33 10.71 7.92 10C8.54 9.25 9.46 8.79 10.54 8.79C11.41 8.79 12.2 9.13 12.79 9.75C13.4 10.33 13.8 11.09 13.92 11Z"/>
              </svg>
              <Link href="/">
                <a className="font-bold text-xl text-primary-700">CutleryWholesale</a>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 text-sm">
              <Link href="/">
                <a className="py-4 px-1 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
                  Home
                </a>
              </Link>
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <a className="py-4 px-1 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
                        Admin Dashboard
                      </a>
                    </Link>
                  )}
                  {user.role === "wholesaler" && (
                    <Link href="/wholesaler">
                      <a className="py-4 px-1 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
                        Wholesaler Dashboard
                      </a>
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="py-4 px-1 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth-wholesaler">
                    <a className="py-4 px-1 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
                      Wholesaler Login
                    </a>
                  </Link>
                  <Link href="/auth-admin">
                    <a className="py-4 px-1 border-b-2 border-transparent font-medium text-neutral-500 hover:text-neutral-700 hover:border-neutral-300">
                      Admin Login
                    </a>
                  </Link>
                </>
              )}
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <Link href="/">
              <a className="block py-2 text-neutral-500 hover:text-neutral-700">
                Home
              </a>
            </Link>
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <a className="block py-2 text-neutral-500 hover:text-neutral-700">
                      Admin Dashboard
                    </a>
                  </Link>
                )}
                {user.role === "wholesaler" && (
                  <Link href="/wholesaler">
                    <a className="block py-2 text-neutral-500 hover:text-neutral-700">
                      Wholesaler Dashboard
                    </a>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-neutral-500 hover:text-neutral-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth-wholesaler">
                  <a className="block py-2 text-neutral-500 hover:text-neutral-700">
                    Wholesaler Login
                  </a>
                </Link>
                <Link href="/auth-admin">
                  <a className="block py-2 text-neutral-500 hover:text-neutral-700">
                    Admin Login
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-grow">
        {children}
      </div>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="h-6 w-6 text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.92 11H18V13H13.92C13.8 13.84 13.4 14.59 12.79 15.17C12.19 15.79 11.41 16.13 10.54 16.13C9.46 16.13 8.53 15.67 7.92 14.92C7.33 14.21 7 13.39 7 12.46C7 11.54 7.33 10.71 7.92 10C8.54 9.25 9.46 8.79 10.54 8.79C11.41 8.79 12.2 9.13 12.79 9.75C13.4 10.33 13.8 11.09 13.92 11Z"/>
                </svg>
                <span className="font-bold">CutleryWholesale</span>
              </div>
              <p className="text-neutral-400 text-sm">Premium cutlery solutions for wholesale distribution since 1995.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">Chef Knives</a></li>
                <li><a href="#" className="hover:text-white">Flatware Sets</a></li>
                <li><a href="#" className="hover:text-white">Kitchen Tools</a></li>
                <li><a href="#" className="hover:text-white">Custom Orders</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Testimonials</a></li>
                <li><a href="#" className="hover:text-white">Become a Wholesaler</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-start space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>123 Business Avenue, Suite 400, New York, NY 10001</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@cutlerywholesale.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">© 2023 CutleryWholesale. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-neutral-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.408.593 24 1.324 24h11.494v-9.294H9.689v-3.621h3.129V8.41c0-3.099 1.894-4.785 4.659-4.785 1.325 0 2.464.097 2.796.141v3.24h-1.921c-1.5 0-1.792.721-1.792 1.771v2.311h3.584l-.465 3.63H16.56V24h6.115c.733 0 1.325-.592 1.325-1.324V1.324C24 .593 23.408 0 22.676 0" />
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
