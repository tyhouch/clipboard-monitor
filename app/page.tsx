// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Shield, History, AlertTriangle, Trash2 } from 'lucide-react'

type PasteCheck = {
  id: number
  contentPreview: string
  isSafe: boolean
  timestamp: string
}

type Alert = {
  type: 'success' | 'error'
  message: string
}

export default function Home() {
  const [inputValue, setInputValue] = useState('')
  const [alert, setAlert] = useState<Alert | null>(null)
  const [pasteHistory, setPasteHistory] = useState<PasteCheck[]>([])

  useEffect(() => {
    fetchPasteHistory()
  }, [])

  const fetchPasteHistory = async () => {
    try {
      const response = await fetch('/api/paste-history')
      const data = await response.json()
      setPasteHistory(data)
    } catch (error) {
      console.error('Error fetching paste history:', error)
    }
  }

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all history?')) {
      return
    }

    try {
      const response = await fetch('/api/clear-history', {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to clear history')
      }

      setPasteHistory([])
      setAlert({
        type: 'success',
        message: 'History cleared successfully'
      })
    } catch (error) {
      console.error('Error:', error)
      setAlert({
        type: 'error',
        message: 'Failed to clear history'
      })
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault()
    const clipboardData = e.clipboardData.getData('text')
    
    try {
      const response = await fetch('/api/check-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: clipboardData }),
      })
      
      const result = await response.json()
      
      if (result.safe) {
        setInputValue(prev => prev + clipboardData)
        setAlert({
          type: 'success',
          message: 'Content checked and approved.'
        })
      } else {
        setAlert({
          type: 'error',
          message: 'This content appears to contain sensitive information.'
        })
      }
      
      fetchPasteHistory()
    } catch (error) {
      console.error('Error checking content:', error)
      setAlert({
        type: 'error',
        message: 'Error checking content. Please try again.'
      })
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Clipboard Privacy Monitor
        </h1>
        <p className="text-gray-600">
          Protected clipboard monitoring for sensitive information.
        </p>
      </div>

      {alert && (
        <div className={`mb-4 p-4 rounded-md ${
          alert.type === 'error' ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={
              alert.type === 'error' ? 'text-red-500' : 'text-green-500'
            } />
            <p className={
              alert.type === 'error' ? 'text-red-700' : 'text-green-700'
            }>
              {alert.message}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Test Area (Try pasting here):
          </label>
          <textarea
            className="w-full h-32 p-3 border rounded-md"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPaste={handlePaste}
            placeholder="Try pasting some text here..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <h2 className="text-sm font-medium">Recent Paste Checks</h2>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
          <div className="border rounded-md divide-y max-h-80 overflow-y-auto">
            {pasteHistory.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No paste history
              </div>
            ) : (
              pasteHistory.map((entry) => (
                <div key={entry.id} className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={
                      entry.isSafe ? 'text-green-500' : 'text-red-500'
                    } />
                    <span className={
                      entry.isSafe ? 'text-green-600' : 'text-red-600'
                    }>
                      {entry.isSafe ? 'Safe' : 'Blocked'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-800 mt-1 truncate">
                    {entry.contentPreview}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}