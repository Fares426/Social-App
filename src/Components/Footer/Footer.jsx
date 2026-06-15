import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#1877F2] text-white mt-auto">
      
      {/* Main footer content */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div className="col-span-2 sm:col-span-1">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Meetra</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Connect with friends and the world around you on Meetra.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-3 text-blue-200">Company</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-3 text-blue-200">Support</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link to="/safety" className="hover:text-white transition-colors">Safety Center</Link></li>
            <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-3 text-blue-200">Legal</h3>
          <ul className="space-y-2 text-sm text-blue-100">
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            <li><Link to="/ads" className="hover:text-white transition-colors">Ad Preferences</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-400/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-blue-200">
          <span>© {new Date().getFullYear()} Meetra. All rights reserved.</span>
        </div>
      </div>

    </footer>
  )
}