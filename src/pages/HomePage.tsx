import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Brain, FileText, Headphones, LogOut, MessageSquare, Mic, User, Video, Menu, X, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const features = [
    {
      title: "IELTS Tests",
      description: "Practice with our comprehensive collection of IELTS tests",
      icon: <FileText className="h-10 w-10 text-blue-500" />,
      link: "/dashboard",
      color: "bg-blue-50",
    },
    {
      title: "Reading Exercises",
      description: "Improve your reading comprehension with targeted exercises",
      icon: <BookOpen className="h-10 w-10 text-green-500" />,
      link: "/reading-test",
      color: "bg-green-50",
    },
    {
      title: "Writing Practice",
      description: "Enhance your writing skills with structured exercises",
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      link: "/writing-exercises",
      color: "bg-purple-50",
    },
    {
      title: "Listening Tests",
      description: "Train your ear with authentic listening materials",
      icon: <Headphones className="h-10 w-10 text-orange-500" />,
      color: "bg-orange-50",
    },
    {
      title: "Speaking Practice",
      description: "Improve your pronunciation and fluency",
      icon: <Mic className="h-10 w-10 text-red-500" />,
      link: "/pronunciation",
      color: "bg-red-50",
    },
    {
      title: "AI Conversations",
      description: "Practice speaking with our AI language partners",
      icon: <MessageSquare className="h-10 w-10 text-indigo-500" />,
      link: "/ai-conversations",
      color: "bg-indigo-50",
    },
    {
      title: "Vocabulary Building",
      description: "Expand your vocabulary with flashcards and exercises",
      icon: <Brain className="h-10 w-10 text-yellow-500" />,
      link: "/flashcards",
      color: "bg-yellow-50",
    },
    {
      title: "Video Lessons",
      description: "Learn from expert instructors through video tutorials",
      icon: <Video className="h-10 w-10 text-teal-500" />,
      link: "/learn-videos",
      color: "bg-teal-50",
    },
  ];

  // Dashboard-style navbar for authenticated users
  const DashboardNavbar = () => (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-navy-900">
              LetRate
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/reading-test">Reading</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/writing-exercises">Writing</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/pronunciation">Speaking</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/flashcards">Vocabulary</Link>
            </Button>
            {user?.roles.includes("TENANT_ADMIN") && (
              <Button asChild variant="ghost">
                <Link to="/">Admin</Link>
              </Button>
            )}
            <div className="relative group">
              <Button variant="ghost" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {user?.firstName || "User"}
              </Button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                <div className="py-1">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Dashboard
                  </Link>
                    {user?.roles.includes("ADMIN") && (
                      <Link to="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/reading-test"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reading
            </Link>
            <Link
              to="/writing-exercises"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Writing
            </Link>
            <Link
              to="/pronunciation"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Speaking
            </Link>
            <Link
              to="/flashcards"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Vocabulary
            </Link>
            {user?.roles.includes("ADMIN") && (
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  // Homepage navbar for non-authenticated users
  const HomepageNavbar = () => (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-navy-900">
              LetRate
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/#features">Features</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/#testimonials">Testimonials</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#testimonials"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </Link>
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Conditional Navbar */}
      {isAuthenticated ? <DashboardNavbar /> : <HomepageNavbar />}

      {/* Hero Section */}
      <div className="bg-navy-900 text-black">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Master IELTS with LetRate
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-800">
              Your comprehensive platform for IELTS preparation. Practice tests, exercises, and AI-powered tools to help you achieve your target score.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-white text-navy-900 hover:bg-gray-100">
                  <Link to="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-navy-900 hover:bg-gray-100">
                    <Link to="/login">
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Link to="/signup">
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to excel in IELTS
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Our comprehensive platform provides all the tools and resources you need to prepare for your IELTS exam.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.color} border-0 shadow-md transition-all hover:shadow-lg`}>
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                {isAuthenticated ? (
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link to={feature.link || "#"}>
                      Try it now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link to="/login">
                      Sign in to access <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What our users say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Join thousands of successful IELTS test-takers who have improved their scores with LetRate.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Student",
                content: "LetRate helped me improve my IELTS score by 1.5 points. The practice tests were incredibly helpful!",
                score: "Band 7.5",
              },
              {
                name: "Michael Chen",
                role: "Professional",
                content: "The AI conversation feature is amazing for practicing speaking. It's like having a tutor available 24/7.",
                score: "Band 8.0",
              },
              {
                name: "Priya Patel",
                role: "Student",
                content: "The writing exercises with detailed feedback helped me understand my mistakes and improve significantly.",
                score: "Band 7.0",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role} • {testimonial.score}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-navy-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
              Ready to start your IELTS journey?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-900">
              Join thousands of successful test-takers who have improved their scores with LetRate.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="bg-white text-navy-900 hover:bg-gray-100">
                  <Link to="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-white text-navy-900 hover:bg-gray-100">
                    <Link to="/login">
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Link to="/signup">
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">LetRate</h3>
              <p className="text-gray-300 mb-4">
                Your comprehensive platform for IELTS preparation. Practice tests, exercises, and AI-powered tools to help you achieve your target score.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#features" className="text-gray-300 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/#testimonials" className="text-gray-300 hover:text-white">
                    Testimonials
                  </Link>
                </li>
                {isAuthenticated ? (
                  <li>
                    <Link to="/dashboard" className="text-gray-300 hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="text-gray-300 hover:text-white">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link to="/signup" className="text-gray-300 hover:text-white">
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/reading-test" className="text-gray-300 hover:text-white">
                    Reading Tests
                  </Link>
                </li>
                <li>
                  <Link to="/writing-exercises" className="text-gray-300 hover:text-white">
                    Writing Exercises
                  </Link>
                </li>
                <li>
                  <Link to="/pronunciation" className="text-gray-300 hover:text-white">
                    Speaking Practice
                  </Link>
                </li>
                <li>
                  <Link to="/flashcards" className="text-gray-300 hover:text-white">
                    Vocabulary Flashcards
                  </Link>
                </li>
                <li>
                  <Link to="/ai-conversations" className="text-gray-300 hover:text-white">
                    AI Conversations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-2" />
                  <a href="mailto:support@letrate.com" className="hover:text-white">
                    support@letrate.com
                  </a>
                </li>
                <li className="text-gray-300">
                  <p>123 IELTS Street</p>
                  <p>Language City, LC 12345</p>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} LetRate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 