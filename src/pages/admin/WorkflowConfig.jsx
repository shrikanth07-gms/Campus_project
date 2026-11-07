import { useState } from 'react';
import { useDocuments } from '../../context/DocumentContext';
import { Sliders, Plus, CheckCircle, FileText, ArrowRight, Settings } from 'lucide-react';
import Modal from '../../components/common/Modal';

export default function WorkflowConfig() {
  const { documentTypes, addDocumentType } = useDocuments();
  const [typesList, setTypesList] = useState(documentTypes);

  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState({
    name: '',
    code: '',
    description: '',
    default_priority: 'this_week',
    requires_physical_signature: false,
    stagesText: 'Class Coordinator Review, HOD Endorsement, Final Clearance'
  });

  const handleAddType = (e) => {
    e.preventDefault();
    if (!newType.name || !newType.code) return;

    const stages = newType.stagesText.split(',').map(s => s.trim()).filter(Boolean);

    const added = addDocumentType({
      name: newType.name,
      code: newType.code.toUpperCase(),
      description: newType.description,
      default_priority: newType.default_priority,
      requires_physical_signature: Boolean(newType.requires_physical_signature),
      default_workflow_stages: stages
    });

    setTypesList([...typesList, added]);
    setShowModal(false);
    setNewType({
      name: '',
      code: '',
      description: '',
      default_priority: 'this_week',
      requires_physical_signature: false,
      stagesText: 'Class Coordinator Review, HOD Endorsement, Final Clearance'
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Document Types & Approval Workflows</h1>
          <p>
            Configure university certificate categories, required approval stages, default priorities, and physical signature mandates.
          </p>
        </div>

        <div className="page-actions">
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Document Category
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
        {typesList.map((dt) => (
          <div
            key={dt.id}
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
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {dt.name}
                </h3>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {dt.code}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--gray-600)', margin: '10px 0 16px', lineHeight: 1.5 }}>
                {dt.description}
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8' }}>
                  Default: {dt.default_priority.replace('_', ' ').toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px', background: dt.requires_physical_signature ? '#fef3c7' : '#ecfdf5', color: dt.requires_physical_signature ? '#b45309' : '#047857' }}>
                  {dt.requires_physical_signature ? 'Physical Sig. Required' : 'Digital Only'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Configured Approval Pipeline:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(dt.default_workflow_stages || []).map((stage, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--gray-700)',
                        backgroundColor: 'var(--gray-50)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--gray-200)'
                      }}
                    >
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                        {idx + 1}
                      </span>
                      <span>{stage}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--gray-100)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', color: 'var(--success-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={13} /> Active University Workflow
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Type Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Configure New Document Type & Workflow"
      >
        <form onSubmit={handleAddType}>
          <div className="form-group">
            <label className="form-label">
              Document Category Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Character Certificate"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Unique Code <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. CHAR_CERT"
              value={newType.code}
              onChange={(e) => setNewType({ ...newType, code: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Eligibility Guidelines</label>
            <textarea
              className="form-control"
              placeholder="Explain prerequisites and acceptable student use cases..."
              value={newType.description}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Priority Level</label>
            <select
              className="form-control"
              value={newType.default_priority}
              onChange={(e) => setNewType({ ...newType, default_priority: e.target.value })}
            >
              <option value="this_week">This Week (Standard)</option>
              <option value="urgent">Urgent</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mandate Physical Wet Signature?</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="modalSig"
                  checked={newType.requires_physical_signature === true}
                  onChange={() => setNewType({ ...newType, requires_physical_signature: true })}
                />
                Yes (In-person verification)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="modalSig"
                  checked={newType.requires_physical_signature === false}
                  onChange={() => setNewType({ ...newType, requires_physical_signature: false })}
                />
                No (Digital approval only)
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Approval Pipeline Stages (Comma-separated)
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Mentor Review, HOD Endorsement, Registrar Sign-off"
              value={newType.stagesText}
              onChange={(e) => setNewType({ ...newType, stagesText: e.target.value })}
              required
            />
            <span style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px', display: 'block' }}>
              Submissions for this document type will proceed through these stages sequentially.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Document Workflow
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

