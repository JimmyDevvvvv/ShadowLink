import React from 'react'

type User = {
  email: string
  department: string
  exposure_risk_score: number
  risk_category: string
  mfa_enabled?: boolean
  clicked_phishing?: boolean
  breach_history?: { service: string; date: string }[]
}

interface Props {
  user: User | null
  onClose: () => void
}

export default function UserDetailModal({ user, onClose }: Props) {
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">User Details</h2>

        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Department:</strong> {user.department}</p>
          <p><strong>Risk Score:</strong> {user.exposure_risk_score.toFixed(4)}</p>
          <p><strong>Risk Level:</strong> {user.risk_category}</p>
          <p><strong>MFA Enabled:</strong> {user.mfa_enabled ? '✅' : '❌'}</p>
          <p><strong>Clicked Phishing:</strong> {user.clicked_phishing ? '🚨' : '—'}</p>
        </div>

        {user.breach_history && user.breach_history.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Breach History:</h3>
            <ul className="list-disc ml-6">
              {user.breach_history.map((b, i) => (
                <li key={i}>{b.service} – {b.date}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
