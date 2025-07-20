import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { saveAs } from 'file-saver'

type User = {
  email: string
  department: string
  exposure_risk_score: number
  risk_category: string
  mfa_enabled?: boolean
  clicked_phishing?: boolean
}

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('department', { header: 'Department' }),
  columnHelper.accessor('exposure_risk_score', {
    header: 'Risk Score',
    cell: info => info.getValue().toFixed(4),
  }),
  columnHelper.accessor('risk_category', { header: 'Risk Category' }),
  columnHelper.accessor('mfa_enabled', {
    header: 'MFA',
    cell: info => (info.getValue() ? '✅' : '❌'),
  }),
  columnHelper.accessor('clicked_phishing', {
    header: 'Clicked Phishing',
    cell: info => (info.getValue() ? '🚨' : '—'),
  }),
]

export default function UserExplorerTable({
  data,
  onRowClick,
}: {
  data: User[]
  onRowClick: (user: User) => void
}) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [mfaFilter, setMfaFilter] = useState('')
  const [phishFilter, setPhishFilter] = useState('')

  const filteredData = useMemo(() => {
    return data.filter(u => {
      const matchDept = deptFilter ? u.department === deptFilter : true
      const matchRisk = riskFilter ? u.risk_category === riskFilter : true
      const matchMfa = mfaFilter === 'enabled' ? u.mfa_enabled === true
                    : mfaFilter === 'disabled' ? u.mfa_enabled === false
                    : true
      const matchPhish = phishFilter === 'clicked' ? u.clicked_phishing === true
                      : phishFilter === 'clean' ? u.clicked_phishing === false
                      : true
      const matchEmail = u.email.toLowerCase().includes(globalFilter.toLowerCase())
      return matchDept && matchRisk && matchMfa && matchPhish && matchEmail
    })
  }, [data, deptFilter, riskFilter, mfaFilter, phishFilter, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const allDepartments = [...new Set(data.map(u => u.department))]
  const allRiskLevels = [...new Set(data.map(u => u.risk_category))]

  const handleExportCSV = () => {
    const headers = ['Email', 'Department', 'Risk Score', 'Risk Category', 'MFA', 'Clicked Phishing']
    const rows = filteredData.map(u => [
      u.email,
      u.department,
      u.exposure_risk_score.toFixed(4),
      u.risk_category,
      u.mfa_enabled ? 'Yes' : 'No',
      u.clicked_phishing ? 'Yes' : 'No',
    ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, 'shadowlink_filtered_users.csv')
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl mb-4">User Explorer Table</h2>

      {/* 🔍 Filter Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <input
          placeholder="Search email..."
          className="border p-2 w-full"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
        />

        <select className="border p-2" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {allDepartments.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>

        <select className="border p-2" value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
          <option value="">All Risk Levels</option>
          {allRiskLevels.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select className="border p-2" value={mfaFilter} onChange={e => setMfaFilter(e.target.value)}>
          <option value="">MFA: All</option>
          <option value="enabled">Enabled</option>
          <option value="disabled">Disabled</option>
        </select>

        <select className="border p-2" value={phishFilter} onChange={e => setPhishFilter(e.target.value)}>
          <option value="">Phishing: All</option>
          <option value="clicked">Clicked</option>
          <option value="clean">Clean</option>
        </select>
      </div>

      {/* 🧾 Export Button */}
      <div className="mb-4">
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Export Filtered CSV
        </button>
      </div>

      {/* 📊 Table */}
      <table className="w-full border">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th className="border px-4 py-2 text-left" key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} onClick={() => onRowClick(row.original)} className="cursor-pointer hover:bg-gray-100">
              {row.getVisibleCells().map(cell => (
                <td className="border px-4 py-2" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
