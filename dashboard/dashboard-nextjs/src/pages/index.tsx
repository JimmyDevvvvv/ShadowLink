import { useEffect, useState } from 'react'
import UserExplorerTable from '../../components/UserExplorerTable'
import { Dialog } from '@headlessui/react'
import { Pie, Bar } from 'react-chartjs-2'
import 'chart.js/auto'

type UserRisk = {
  email: string
  department: string
  exposure_risk_score: number
  risk_category: string
  mfa_enabled?: boolean
  clicked_phishing?: boolean
  password_reuse_score?: number
  security_training_score?: number
  flags?: string[]
}

export default function Dashboard() {
  const [data, setData] = useState<UserRisk[] | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserRisk | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetch('/risk_data.json')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div>Loading ShadowLink...</div>

  const dist: Record<string, number> = {}
  data.forEach(u => {
    dist[u.risk_category] = (dist[u.risk_category] || 0) + 1
  })

  const top = [...data]
    .sort((a, b) => b.exposure_risk_score - a.exposure_risk_score)
    .slice(0, 10)

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">ShadowLink Dashboard</h1>

      {/* 📊 Summary Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-sm text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-sm text-gray-500">MFA Enabled</h3>
          <p className="text-2xl font-bold">
            {Math.round(data.filter(u => u.mfa_enabled).length / data.length * 100)}%
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-sm text-gray-500">Clicked Phishing</h3>
          <p className="text-2xl font-bold">
            {Math.round(data.filter(u => u.clicked_phishing).length / data.length * 100)}%
          </p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h3 className="text-sm text-gray-500">Avg Risk Score</h3>
          <p className="text-2xl font-bold">
            {(
              data.reduce((acc, u) => acc + u.exposure_risk_score, 0) / data.length
            ).toFixed(3)}
          </p>
        </div>
      </section>

      {/* 📈 Charts */}
      <section className="grid grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="text-xl mb-2">Risk Distribution</h2>
          <Pie data={{
            labels: Object.keys(dist),
            datasets: [{ data: Object.values(dist), backgroundColor: ['#4ade80', '#facc15', '#f97316', '#ef4444', '#7e22ce'] }]
          }} />
        </div>

        <div>
          <h2 className="text-xl mb-2">Top Risky Users</h2>
          <Bar data={{
            labels: top.map(u => u.email),
            datasets: [{
              label: 'Risk Score',
              data: top.map(u => u.exposure_risk_score),
              backgroundColor: '#ef4444'
            }]
          }} />
        </div>
      </section>

      {/* 🧭 User Table */}
      <UserExplorerTable data={data} onRowClick={(user: UserRisk) => {
        setSelectedUser(user)
        setIsModalOpen(true)
      }} />

      {/* 🧠 User Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl space-y-4">
            <Dialog.Title className="text-xl font-bold">
              {selectedUser?.email}
            </Dialog.Title>
            <div>
              <p><strong>Department:</strong> {selectedUser?.department}</p>
              <p><strong>Risk Score:</strong> {selectedUser?.exposure_risk_score.toFixed(4)}</p>
              <p><strong>Risk Level:</strong> {selectedUser?.risk_category}</p>
            </div>
            <div className="border-t pt-3 space-y-1">
              <p><strong>MFA Enabled:</strong> {selectedUser?.mfa_enabled ? 'Yes' : 'No'}</p>
              <p><strong>Clicked Phishing:</strong> {selectedUser?.clicked_phishing ? 'Yes' : 'No'}</p>
              <p><strong>Password Reuse Score:</strong> {selectedUser?.password_reuse_score}</p>
              <p><strong>Security Training Score:</strong> {selectedUser?.security_training_score}</p>
            </div>
            <div className="border-t pt-3">
              <p className="font-semibold">🔒 Recommendations:</p>
              <ul className="list-disc ml-5 text-sm">
                {selectedUser?.password_reuse_score! > 0.6 && (
                  <li>Reset user's password</li>
                )}
                {selectedUser?.clicked_phishing && (
                  <li>Enroll in phishing awareness training</li>
                )}
                {!selectedUser?.mfa_enabled && (
                  <li>Force MFA setup</li>
                )}
              </ul>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </main>
  )
}
