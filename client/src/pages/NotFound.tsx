import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          color="primary"
          variant="flat"
          startContent={<Home size={18} />}
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
        <Button
          variant="bordered"
          startContent={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
