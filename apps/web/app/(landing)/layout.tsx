import Link from "next/dist/client/link";

export default function Layout({children}) {
  return (
    <div>
        <header>
            <nav className="flex justify-between items-center p-4">
                <div>
                    <Link href="/">Click & Whirr</Link>
                    <span className="text-gray-500 ml-2">|</span>
                    <Link href="/courses">Courses</Link>
                    <Link href="/projects">Projects</Link>
                    <Link href="/resources">Resources</Link>
                    <Link href="/pricing">Pricing</Link>
                </div>
                <Link href="/">Sign In</Link>
            </nav>
        </header>
      {children}
        <footer>
            <p>© {new Date().getFullYear()} RGRL</p>
            <nav>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            </nav>
        </footer>
    </div>
  )
}
