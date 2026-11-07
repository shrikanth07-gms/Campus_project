import { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { Search, Plus, UserCheck, Building, Mail, MapPin, Edit, ShieldCheck } from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function FacultyManagement() {
  const { facultyDirectory, departments, addFacultyMember, updateFacultyMember } = useDocuments();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    department_id: '',
    designation: '',
    office_location: ''
  });

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({
      name: '',
      email: '',
      department_id: departments[0]?.id || '',
      designation: 'Assistant Professor / Class Coordinator',
      office_location: 'SOCIT Block, Room 204'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (fac) => {
    setEditId(fac.id);
    setForm({
      name: fac.name,
      email: fac.email,
      department_id: fac.department_id,
      designation: fac.designation,
      office_location: fac.office_location
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === form.department_id);
    const facultyData = {
      ...form,
      department_name: dept?.name || 'Department'
    };

    if (editId) {
      updateFacultyMember(editId, facultyData);
    } else {
      addFacultyMember(facultyData);
    }

    setShowModal(false);
  };

  const filtered = facultyDirectory.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Faculty Directory Administration</h1>
          <p>
            Manage verified faculty profiles, designations, office locations, and department associations for REVA University.
          </p>
        </div>

        <div className="page-actions">
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} /> Add Faculty Member
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="dashboard-card" style={{ padding: '18px 24px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            placeholder="Search faculty by name or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Table */}
      <div className="dashboard-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Official Email</th>
                <th>Office Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fac) => (
                <tr key={fac.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{fac.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--primary-700)', fontWeight: 600 }}>
                      {fac.designation}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                      {fac.department_name || 'Computing & IT'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: 'var(--gray-700)' }}>{fac.email}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{fac.office_location}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', background: 'var(--success-50)', color: 'var(--success-700)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      Verified
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? "Edit Faculty Member" : "Add Faculty Member"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Full Name with Title <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Harish M (Demo Faculty)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Official Email <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="harish.m.demo@reva.edu.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Designation / Role</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Class Coordinator / Associate Professor"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-control"
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Office / Chamber Location</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. SOCIT Block, Floor 3, Room 310"
              value={form.office_location}
              onChange={(e) => setForm({ ...form, office_location: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editId ? 'Save Changes' : 'Add to Directory'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

