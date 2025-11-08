import { CreateIncidentForm } from '../components/CreateIncidentForm';
import Link from 'next/link';

export default function ReportIncident() {
  return (
    <div className="page-container">
      <div className="page-content">
        <header className="page-header">
          <h1 className="page-title">
            Report an Incident
          </h1>
          <p className="page-subtitle">
            Complete the form to report a problem in your community
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              href="/incidents"
              className="btn-primary"
            >
              <span>View all reported incidents</span>
            </Link>
          </div>
        </header>
        <CreateIncidentForm />
      </div>
    </div>
  );
}
