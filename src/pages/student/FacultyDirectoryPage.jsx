import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocuments } from '../../context/DocumentContext';
import {
  Search,
  Filter,
  UserCheck,
  Building,
  Mail,
  MapPin,
  FilePlus,
  Info,
  ShieldCheck
} from 'lucide-react';

export default function FacultyDirectoryPage() {
  const { facultyDirectory, departments } = useDocuments();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');

  const filtered = facultyDirectory.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.email.toLowerCase().includes(search.toLowerCase()) ||
      fac.office_location.toLowerCase().includes(search.toLowerCase()) ||
      fac.designation.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'all' || fac.department_id === deptFilter;
    const matchesDesig =
      designationFilter === 'all' ||
      fac.designation.toLowerCase().includes(designationFilter.toLowerCase());

    return matchesSearch && matchesDept && matchesDesig;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Faculty & Authority Directory</h1>
          <p>
            Find authorized class coordinators, HODs, directors, and administrative officers to route your documents.
          </p>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontSize: '13px',
          color: '#1e40af'
        }}
      >
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Sample Demonstration Data:</strong> All names and emails shown below are clearly labeled demo profiles for REVA University workflow simulation.
        </span>
      </div>

      {/* Filter and Search Box */}
      <div className="dashboard-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)'
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by faculty name, designation, or office..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="coordinator">Class Coordinators</option>
              <option value="hod">HODs</option>
              <option value="director">Directors</option>
              <option value="administrative">Admin Officers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            No faculty members matched your search criteria.
          </div>
        ) : (
          filtered.map((fac) => (
            <div
              key={fac.id}
              className="dashboard-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                marginBottom: 0
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-100)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '17px'
                      }}
                    >
                      {fac.name.split(' ')[1]?.[0] || 'F'}
                    </div>

                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--gray-900)' }}>
                        {fac.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: 'var(--primary-700)', fontWeight: 600, marginTop: '2px' }}>
                        {fac.designation}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      backgroundColor: 'var(--success-50)',
                      color: 'var(--success-700)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600
                    }}
                  >
                    <ShieldCheck size={12} /> Verified
                  </span>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--gray-600)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={14} color="var(--gray-400)" />
                    <span>{fac.department_name || 'School of Computing & IT'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="var(--gray-400)" />
                    <span style={{ color: 'var(--gray-700)' }}>{fac.email}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="var(--gray-400)" />
                    <span>{fac.office_location}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '22px', borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
                <Link
                  to={`/student/submit?facultyId=${fac.id}`}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  <FilePlus size={15} /> Submit Document to {fac.name.split(' ')[0]}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

