import React from 'react'

export default function LoaderPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-[680px] mx-auto space-y-4">
        {[1, 2].map((item) => (
          <div 
            key={item} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
          >
            {/* Header Skeleton */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded-md w-32" />
                <div className="h-3 bg-gray-200 rounded-md w-20" />
              </div>
            </div>

            {/* Body Text Skeleton */}
            <div className="space-y-2.5 mb-4">
              <div className="h-3.5 bg-gray-200 rounded-md w-full" />
              <div className="h-3.5 bg-gray-200 rounded-md w-[92%]" />
              <div className="h-3.5 bg-gray-200 rounded-md w-[65%]" />
            </div>

            {/* Image Skeleton */}
            <div className="h-64 bg-gray-200 rounded-lg w-full mb-4" />

            {/* Actions Skeleton */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="h-9 bg-gray-200 rounded-lg w-[30%]" />
              <div className="h-9 bg-gray-200 rounded-lg w-[30%]" />
              <div className="h-9 bg-gray-200 rounded-lg w-[30%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}