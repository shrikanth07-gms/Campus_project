import { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { Building, GitBranch, Plus, FolderTree } from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function DepartmentManagement() {
  const { departments, branches } = useDocuments();
  const [deptList, setDeptList] = useState(departments);
  const [branchList, setBranchList] = useState(branches);

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '' });

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', code: '', department_id: deptList[0]?.id || '' });

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;

    const added = {
      id: `dept-${Date.now()}`,
      name: newDept.name,
      code: newDept.code.toUpperCase()
    };

    setDeptList([...deptList, added]);
    setShowDeptModal(false);
    setNewDept({ name: '', code: '' });
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.code) return;

    const added = {
      id: `branch-${Date.now()}`,
      department_id: newBranch.department_id,
      name: newBranch.name,
      code: newBranch.code.toUpperCase()
    };

    setBranchList([...branchList, added]);
    setShowBranchModal(false);
    setNewBranch({ name: '', code: '', department_id: deptList[0]?.id || '' });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Departments & Academic Branches</h1>
          <p>
            Structure academic faculties, schools, and degree programmes for REVA University.
          </p>
        </div>

        <div className="page-actions">
          <button onClick={() => setShowDeptModal(true)} className="btn btn-outline">
            <Plus size={16} /> Add Department
          </button>
          <button onClick={() => setShowBranchModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Departments List */}
        <div className="dashboard-card">
          <div className="card-header-bar">
            <h2>Academic Departments / Schools ({deptList.length})</h2>
            <Building size={18} color="var(--gray-400)" />
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {deptList.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--gray-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '15px' }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    Code: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.code}</span>
                  </div>
                </div>

                <span style={{ fontSize: '12px', background: 'var(--primary-50)', color: 'var(--primary-700)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Branches List */}
        <div className="dashboard-card">
          <div className="card-header-bar">
            <h2>Degree Programmes & Branches ({branchList.length})</h2>
            <GitBranch size={18} color="var(--gray-400)" />
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {branchList.map((b) => {
              const parentDept = deptList.find(d => d.id === b.department_id);

              return (
                <div
                  key={b.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '15px' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>
                      {parentDept ? parentDept.name : 'School'} • <span style={{ fontFamily: 'monospace' }}>{b.code}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', background: 'var(--success-50)', color: 'var(--success-700)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    Enrolling
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Add Academic Department"
      >
        <form onSubmit={handleAddDept}>
          <div className="form-group">
            <label className="form-label">Department / School Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. School of Civil Engineering"
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. CIVIL"
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowDeptModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Branch Modal */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title="Add Degree Branch"
      >
        <form onSubmit={handleAddBranch}>
          <div className="form-group">
            <label className="form-label">Parent Department</label>
            <select
              className="form-control"
              value={newBranch.department_id}
              onChange={(e) => setNewBranch({ ...newBranch, department_id: e.target.value })}
            >
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Branch Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Information Science and Engineering"
              value={newBranch.name}
              onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Branch Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ISE"
              value={newBranch.code}
              onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowBranchModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

