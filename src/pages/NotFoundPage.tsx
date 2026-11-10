import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-4">
      <FileQuestion className="w-16 h-16 mx-auto text-[#A0451E]" />
      <h1 className="text-3xl font-extrabold text-[#22231F] dark:text-[#EDECE6]">
        404 - Page Not Found
      </h1>
      <p className="text-sm text-[#5C5F56] dark:text-[#A8ABA0]">
        The route you requested does not exist in Roadmap Receipts.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[#4F6B3A] text-white font-bold text-sm hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
