import { useEffect, useCallback } from 'react';
import ReactModal from 'react-modal';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onCancel}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 animate-scaleIn outline-none"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800">확인</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          취소
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
        >
          확인
        </button>
      </div>
    </ReactModal>
  );
}
