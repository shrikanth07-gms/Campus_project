import { Link } from "react-router-dom";
import { GraduationCap, ShieldCheck, Heart } from "lucide-react";

function Footer() {
  return (
    <footer className="footer" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e8edf5', padding: '50px 9% 30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', textAlign: 'left', marginBottom: '40px' }}>
        <div>
          <div className="footer-brand" style={{ justifyContent: 'flex-start', marginBottom: '12px' }}>
            <GraduationCap size={24} />
            <span>CampusFlow</span>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
            Centralized university document submission, verification, and multi-stage approval management system.
          </p>
          <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={14} /> Supporting REVA University, Bengaluru
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
            Quick Portals
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <li><Link to="/college/reva" style={{ color: '#64748b', textDecoration: 'none' }}>REVA Student Portal</Link></li>
            <li><Link to="/college/reva" style={{ color: '#64748b', textDecoration: 'none' }}>Faculty & Signatory Login</Link></li>
            <li><Link to="/student/submit" style={{ color: '#64748b', textDecoration: 'none' }}>Submit Document</Link></li>
            <li><Link to="/student/faculty" style={{ color: '#64748b', textDecoration: 'none' }}>Faculty Directory</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
            Supported Documents
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <li>Bonafide Certificates</li>
            <li>No Objection Certificates (NOC)</li>
            <li>Internship Clearances</li>
            <li>Scholarship Endorsements</li>
            <li>Capstone Project Approvals</li>
          </ul>
        </div>

        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
            Institutional Compliance
          </h4>
          <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            CampusFlow implements role-based access control, private document storage, and verified audit trails.
          </p>
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#94a3b8' }}>
            First University Supported: REVA University, Bengaluru, Karnataka, India.
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
        <div>
          © 2026 CampusFlow Platform. All rights reserved.
        </div>
        <div>
          Designed for modern university academic workflows.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
