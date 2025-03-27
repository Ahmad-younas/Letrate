import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Unauthorized Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 