import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  FileCheck,
  Clock,
  ShieldCheck,
  Upload,
  CheckCircle,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
  Send,
  Zap,
  Building,
  Users,
  Download,
  Info
} from 'lucide-react';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/Home.css';

export default function Home() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const colleges = [
    {
      name: "REVA University",
      location: "Bengaluru, Karnataka, India",
      slug: "reva",
      type: "State Private University"
    }
  ];

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCollege = () => {
    navigate("/college/reva");
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">
            <GraduationCap size={16} />
            Smart University Document Management
          </div>

          <h1>
            Your University Documents,
            <span> Simplified.</span>
          </h1>

          <p style={{ fontSize: '18px', color: '#2563eb', fontWeight: 600, margin: '8px 0 12px' }}>
            Fast, trackable approvals from submission to signature.
          </p>

          <p>
            Submit documents, connect with faculty, track approvals and manage your university paperwork, all in one place.
          </p>

          {/* SEARCH SECTION */}
          <div className="search-container" id="university-search">
            <div className="search-box">
              <Search size={22} />
              <input
                type="text"
                placeholder="Search your university (e.g. REVA University)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() => {
                  if (filteredColleges.length > 0) {
                    openCollege();
                  }
                }}
              >
                Search
              </button>
            </div>

            {search.trim() !== '' && (
              <div className="search-results">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map((college) => (
                    <div
                      className="college-result"
                      key={college.name}
                      onClick={openCollege}
                    >
                      <div className="college-icon">
                        <GraduationCap size={26} />
                      </div>

                      <div className="college-details">
                        <h3>{college.name}</h3>
                        <p>{college.location} • Available on RoutePulse</p>
                      </div>

                      <ArrowRight size={20} />
                    </div>
                  ))
                ) : (
                  <p className="no-result">
                    No university found matching "{search}". Currently, REVA University is supported.
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '24px', flexWrap: 'wrap' }}>
            <Link to="/college/reva" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
              Launch REVA Portal <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn btn-outline" style={{ padding: '12px 24px', fontSize: '15px' }}>
              See How It Works
            </a>
          </div>

          <div className="hero-note" style={{ marginTop: '20px' }}>
            <CheckCircle size={16} />
            Supported Institution: REVA University, Bengaluru
          </div>
        </div>

        {/* HERO VISUAL DECORATION */}
        <div className="hero-decoration">
          <div className="decoration-circle circle-one"></div>
          <div className="decoration-circle circle-two"></div>

          <div className="floating-card">
            <div className="floating-icon">
              <FileCheck size={30} />
            </div>

            <h3>Multi-Stage Approvals</h3>
            <p>From Class Coordinator to HOD & Director in one streamlined workflow.</p>

            <div className="floating-status">
              <CheckCircle size={15} />
              Live Real-Time Stepper & Alerts
            </div>
          </div>
        </div>
      </section>

      {/* HOW ROUTEPULSE WORKS */}
      <section id="how-it-works" style={{ padding: '80px 9%', backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <div className="section-heading">
          <span>WORKFLOW SIMPLIFIED</span>
          <h2>How RoutePulse Works</h2>
          <p>
            Eliminating long queues, physical visits, and missing paperwork through transparent digital approval pipelines.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '28px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '16px' }}>
              1
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', color: '#0f172a' }}>
              Find Authority & Submit
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Search the authorized university faculty directory. Upload your document with deadline, priority, and physical signature requirements.
            </p>
          </div>

          <div style={{ padding: '28px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '16px' }}>
              2
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', color: '#0f172a' }}>
              Track Progress & Chat
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Watch your document move stage by stage with real-time timestamps. Exchange messages and upload requested revisions directly.
            </p>
          </div>

          <div style={{ padding: '28px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginBottom: '16px' }}>
              3
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', color: '#0f172a' }}>
              Receive & Download
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Get notified immediately upon approval. Download digitally verified receipts or in-person verification certificates.
            </p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="features-section" id="features">
        <div className="section-heading">
          <span>PLATFORM CAPABILITIES</span>
          <h2>Everything You Need, In One Place</h2>
          <p>
            Purpose-built for students, faculty coordinators, department heads, and academic administrators.
          </p>
        </div>

        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="feature-card">
            <div className="feature-icon blue">
              <Upload size={27} />
            </div>
            <h3>Easy Document Submission</h3>
            <p>
              Upload PDF, DOCX, and images with multi-stage department routing and urgency tagging.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <Clock size={27} />
            </div>
            <h3>Real-Time Approval Tracking</h3>
            <p>
              Follow each approval stage: Class Coordinator, HOD endorsement, and Director clearance.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">
              <MessageSquare size={27} />
            </div>
            <h3>Faculty Communication</h3>
            <p>
              Dedicated per-document conversation threads between students and assigned faculty.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon orange">
              <ShieldCheck size={27} />
            </div>
            <h3>Secure Document Storage</h3>
            <p>
              Protected document storage with row-level security and strict academic authorization.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <AlertTriangle size={27} />
            </div>
            <h3>Deadlines & Priority Levels</h3>
            <p>
              Categorize submissions as Urgent, This Week, or This Month to ensure timely reviews.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">
              <FileCheck size={27} />
            </div>
            <h3>Faster Approval Workflows</h3>
            <p>
              Reduce manual turnaround from weeks to days with automated forwarding and reminders.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS FOR STUDENTS & FACULTY */}
      <section style={{ padding: '80px 9%', backgroundColor: '#f8fafc' }}>
        <div className="section-heading">
          <span>WHY ROUTEPULSE</span>
          <h2>Designed for Every Campus Stakeholder</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
          {/* Student Benefits */}
          <div style={{ padding: '36px', backgroundColor: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>For Students</h3>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#475569' }}>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Submit bonafide, NOC, and scholarship requests from anywhere without visiting cabins.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Clear visibility on which authority holds your document right now.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Upload revised versions with 1 click if corrections are requested.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Download verified receipts and completion certificates anytime.</span>
              </li>
            </ul>
          </div>

          {/* Faculty Benefits */}
          <div style={{ padding: '36px', backgroundColor: 'white', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>For Faculty & Authorities</h3>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#475569' }}>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Organized assigned inbox filtered by urgency, student SRN, and deadlines.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Approve, reject with mandatory justification, or forward to HOD with one click.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Clear physical signature scheduling instructions for wet-ink requirements.</span>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Complete immutable audit history for academic accreditation and verification.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ABOUT & TRANSPARENCY NOTICE */}
      <section className="about-section" id="about">
        <div>
          <span>ROUTEPULSE PLATFORM</span>
          <h2>Less paperwork. More progress.</h2>
          <p>
            RoutePulse connects students, faculty, and departments through one centralized document management platform, engineered for institutional security and privacy.
          </p>
          <div style={{ marginTop: '20px', padding: '14px 18px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #dce5f5', fontSize: '13px', color: '#64748b' }}>
            <Info size={16} color="#2563eb" style={{ display: 'inline', marginRight: '6px' }} />
            <strong>Institutional Notice:</strong> The initial deployment profile supports REVA University, Bengaluru, Karnataka, India. RoutePulse is an independent document management system architected for extensible multi-university adoption.
          </div>
        </div>

        <div className="about-highlight">
          <GraduationCap size={45} />
          <h3>REVA University Portal</h3>
          <p>
            Access the dedicated university workspace to submit documents or manage student review queues.
          </p>
          <Link to="/college/reva" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            Enter Portal
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

