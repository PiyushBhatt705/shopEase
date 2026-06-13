import React, { useEffect, useState } from "react";

const Toast = ({ message, duration = 2000, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100 / (duration / 100);
      });
    }, 100);

    const timeout = setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onClose]);

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg w-64">
        <p className="text-sm">{message}</p>

        {/* PROGRESS BAR */}
        <div className="w-full h-1 bg-gray-700 mt-2 rounded">
          <div
            className="h-1 bg-green-400 rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;