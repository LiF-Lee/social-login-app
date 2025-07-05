import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import ReactModal from 'react-modal';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-toastify';
import {
  APPS_QUERY,
  CREATE_APP_MUTATION,
  EDIT_APP_MUTATION,
  DELETE_APP_MUTATION
} from '../queries';

export default function AppCard() {
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(APPS_QUERY);
  const [createApp] = useMutation(CREATE_APP_MUTATION);
  const [editApp] = useMutation(EDIT_APP_MUTATION);
  const [deleteApp] = useMutation(DELETE_APP_MUTATION);

  const [apps, setApps] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', redirectUri: '' });

  const [selectedApp, setSelectedApp] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', redirectUri: '' });

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (data?.me?.apps) {
      setApps(data.me.apps);
    }
  }, [data]);

  const handleAdd = async () => {
    try {
      const { data: res } = await createApp({ variables: newApp });
      setApps(res.app.create.ownerUser.apps);
      setShowAddModal(false);
      setNewApp({ name: '', redirectUri: '' });
      toast.success('앱이 생성되었습니다.');
    } catch (e) {
      toast.error('앱 생성 실패: ' + e.message);
    }
  };

  const openEdit = (app) => {
    setSelectedApp(app);
    setEditForm({ name: app.name, redirectUri: app.redirectUri });
  };

  const confirmEdit = () => {
    if (!selectedApp) return;
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    try {
      const { data: res } = await editApp({
        variables: { appId: Number(selectedApp.id), ...editForm }
      });
      setApps(res.app.edit.ownerUser.apps);
      setShowEditModal(false);
      setSelectedApp(null);
      toast.success('앱이 수정되었습니다.');
    } catch (e) {
      toast.error('앱 수정 실패: ' + e.message);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const { data: res } = await deleteApp({ variables: { appId: Number(deleteId) } });
      setApps(res.app.delete.apps);
      toast.success('앱이 삭제되었습니다.');
    } catch (e) {
      toast.error('앱 삭제 실패: ' + e.message);
    } finally {
      setDeleteId(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    toast.info('앱 삭제가 취소되었습니다.');
    setDeleteId(null);
    setShowDeleteModal(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error.message}</div>;
  }

  return (
    <div className="min-h-screen px-4 py-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">앱 관리</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            뒤로가기
          </button>
        </div>

        {/* 앱 리스트 테이블 */}
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">앱 이름</th>
              <th className="border-b p-2">클라이언트 ID</th>
              <th className="border-b p-2">생성일</th>
              <th className="border-b p-2">관리</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  등록된 앱이 없습니다.
                </td>
              </tr>
            ) : (
              [...apps]
                .sort((a, b) => a.id - b.id)
                .map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="p-2">{app.name}</td>
                    <td className="p-2 text-center font-mono text-xs">{app.clientId}</td>
                    <td className="p-2 text-center">{app.created?.slice(0, 10)}</td>
                    <td className="p-2 text-center space-x-2">
                      <button
                        onClick={() => openEdit(app)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        상세
                      </button>
                      <button
                        onClick={() => openDelete(app.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>

        {/* 추가 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            앱 추가
          </button>
        </div>
      </div>

      {/* 추가 모달 */}
      <ReactModal
        isOpen={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md outline-none"
      >
        <h2 className="text-xl font-bold mb-4">앱 추가</h2>
        <label className="block mb-2">
          <span className="text-sm font-semibold">앱 이름</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={newApp.name}
            onChange={e => setNewApp({ ...newApp, name: e.target.value })}
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm font-semibold">Redirect URI</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={newApp.redirectUri}
            onChange={e => setNewApp({ ...newApp, redirectUri: e.target.value })}
          />
        </label>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            닫기
          </button>
          <button
            onClick={handleAdd}
            disabled={!newApp.name || !newApp.redirectUri}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </ReactModal>

      {/* 상세/수정 모달 */}
      <ReactModal
        isOpen={!!selectedApp}
        onRequestClose={() => setSelectedApp(null)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md outline-none"
      >
        <h2 className="text-xl font-bold mb-4">앱 상세</h2>
        <label className="block mb-2">
          <span className="text-sm font-semibold">앱 이름</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm font-semibold">Redirect URI</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            value={editForm.redirectUri}
            onChange={e => setEditForm({ ...editForm, redirectUri: e.target.value })}
          />
        </label>
        <div className="mb-4">
          <span className="text-sm font-semibold">클라이언트 ID</span>
          <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono select-all break-all whitespace-pre-wrap">{selectedApp?.clientId}</div>
        </div>
        <div className="mb-4">
          <span className="text-sm font-semibold">클라이언트 Secret</span>
          <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono select-all break-all whitespace-pre-wrap">{selectedApp?.clientSecret}</div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setSelectedApp(null)}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            닫기
          </button>
          <button
            onClick={confirmEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            저장
          </button>
        </div>
      </ReactModal>

      <ConfirmModal
        isOpen={showDeleteModal}
        message="정말로 이 앱을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />

      <ConfirmModal
        isOpen={showEditModal}
        message="수정된 내용을 저장하시겠습니까?"
        onConfirm={handleEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
}
