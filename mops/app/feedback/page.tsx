import Link from 'next/link';
import { FeedbackForm } from '../components/FeedbackForm';
import { getCurrentUser } from '@/lib/currentUser';
import { Role } from '@/app/generated/prisma';
import { listFeedbacks } from '@/services/feedback.service';

export default async function FeedbackPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="page-content">
          <header className="page-header">
            <h1 className="page-title">Feedback</h1>
            <p className="page-subtitle">Please log in to send feedback.</p>
            <div className="mt-4 flex justify-center">
              <Link href="/login" className="btn-primary">
                <span>Login</span>
              </Link>
            </div>
          </header>
        </div>
      </div>
    );
  }

  if (currentUser.role === Role.ADMIN) {
    const feedbacks = await listFeedbacks();

    return (
      <div className="page-container">
        <div className="page-content">
          <header className="page-header">
            <h1 className="page-title">Feedback</h1>
            <p className="page-subtitle">All user feedback reports</p>
          </header>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100">
            {feedbacks.length === 0 ? (
              <p className="text-sm text-gray-600">No feedback yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b border-gray-200">
                      <th className="py-2 pr-4">User</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Rating</th>
                      <th className="py-2 pr-4">Message</th>
                      <th className="py-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((feedback) => (
                      <tr key={feedback.id} className="border-b border-gray-100">
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {feedback.user.firstName} {feedback.user.lastName}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {feedback.user.email}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">
                          {feedback.rating}/5
                        </td>
                        <td className="py-2 pr-4 text-gray-700">
                          {feedback.message}
                        </td>
                        <td className="py-2 whitespace-nowrap text-gray-600">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <header className="page-header">
          <h1 className="page-title">Feedback</h1>
          <p className="page-subtitle">
            Tell us about your experience reporting incidents
          </p>
          <div className="mt-4 flex justify-center">
            <Link href="/incidents" className="btn-primary">
              <span>Back to incidents</span>
            </Link>
          </div>
        </header>
        <FeedbackForm />
      </div>
    </div>
  );
}
