import { useState } from 'react';
import { DEMO_PRESET_USERS } from '../../services/mockData';
import { Search, UserCheck, Shield, UserX, Plus, Check, Filter } from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function UserManagement() {
  const [usersList, setUsersList] = useState([
    {
      id: 'u-1',
      full_name: 'Aarav Sharma',
      email: 'aarav.sharma@reva.edu.in',
      role: 'student',
      srn: 'R21EN102',
      department: 'School of Computing & IT',
      is_active: true
    },
    {
      id: 'u-2',
      full_name: 'Dr. Priya Rao',
      email: 'priya.rao.demo@reva.edu.in',
      role: 'faculty',
      srn: '-',
      department: 'School of Computing & IT',
      is_active: true
    },
    {
      id: 'u-3',
      full_name: 'Dr. Suresh Kumar',
      email: 'suresh.kumar.demo@reva.edu.in',
      role: 'hod',
      srn: '-',
      department: 'School of Computing & IT',
      is_active: true
    },
    {
      id: 'u-4',
      full_name: 'Dr. Ramesh Chandra',
      email: 'ramesh.chandra.demo@reva.edu.in',
      role: 'director',
      srn: '-',
      department: 'School of Computing & IT',
      is_active: true
    },
    {
      id: 'u-5',
      full_name: 'Prof. Ananya Sen',
      email: 'ananya.sen.demo@reva.edu.in',
      role: 'faculty',
      srn: '-',
      department: 'School of ECE',
      is_active: true
    },
    {
      id: 'u-6',
      full_name: 'Mr. Vinay Murthy',
      email: 'admin.office.demo@reva.edu.in',
      role: 'admin',
      srn: '-',
      department: 'Student Affairs',
      is_active: true
    }
  ]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvite, setNewInvite] = useState({
    fullName: '',
    email: '',
    role: 'faculty',
    department: 'School of Computing & IT'
  });

  const toggleUserStatus = (id) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u));
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!newInvite.fullName || !newInvite.email) return;

    const newUser = {
      id: `u-${Date.now()}`,
      full_name: newInvite.fullName,
      email: newInvite.email,
      role: newInvite.role,
      srn: '-',
      department: newInvite.department,
      is_active: true
    };

    setUsersList([newUser, ...usersList]);
    setShowInviteModal(false);
    setNewInvite({ fullName: '', email: '', role: 'faculty', department: 'School of Computing & IT' });
  };

  const filtered = usersList.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.srn.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>User Account Management & Roles</h1>
          <p>
            Governed access control. Students self-register; faculty and admin identities are provisioned by university administrators.
          </p>
        </div>

        <div className="page-actions">
          <button onClick={() => setShowInviteModal(true)} className="btn btn-primary">
            <Plus size={16} /> Provision Authorized Staff Account
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="dashboard-card" style={{ padding: '18px 24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '38px' }}
              placeholder="Search by name, email, or SRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="hod">HODs</option>
            <option value="director">Directors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Role</th>
                <th>SRN / Identity</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Authorization Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{u.full_name}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        backgroundColor: u.role === 'student' ? 'var(--primary-100)' : '#fef3c7',
                        color: u.role === 'student' ? 'var(--primary-700)' : '#b45309'
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{u.srn}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--gray-700)' }}>{u.email}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{u.department}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: u.is_active ? 'var(--success-700)' : 'var(--danger-700)'
                      }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: u.is_active ? 'var(--success-500)' : 'var(--danger-500)' }} />
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '12px' }}
                    >
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Staff Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Provision Authorized Faculty / Admin Account"
      >
        <form onSubmit={handleInviteSubmit}>
          <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            Faculty and administrator credentials must be verified and issued through institutional channels.
          </p>

          <div className="form-group">
            <label className="form-label">
              Full Legal Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Rajeshwari N"
              value={newInvite.fullName}
              onChange={(e) => setNewInvite({ ...newInvite, fullName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Official University Email <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="rajeshwari.n@reva.edu.in"
              value={newInvite.email}
              onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Institutional Role</label>
            <select
              className="form-control"
              value={newInvite.role}
              onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
            >
              <option value="faculty">Faculty Member / Class Coordinator</option>
              <option value="hod">Head of Department (HOD)</option>
              <option value="director">School Director / Dean</option>
              <option value="admin">University Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Department / School</label>
            <select
              className="form-control"
              value={newInvite.department}
              onChange={(e) => setNewInvite({ ...newInvite, department: e.target.value })}
            >
              <option value="School of Computing & IT">School of Computing & IT</option>
              <option value="School of ECE">School of ECE</option>
              <option value="School of Mechanical Engineering">School of Mechanical Engineering</option>
              <option value="School of Management">School of Management</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Authorization
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

