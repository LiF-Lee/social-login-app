import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import {
  APPS_QUERY,
  CREATE_APP_MUTATION,
  EDIT_APP_MUTATION,
  DELETE_APP_MUTATION
} from '../queries';

export default function AppCard() {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(APPS_QUERY);

  const [createAppAndFetchApps] = useMutation(CREATE_APP_MUTATION);
  const [editAppAndFetchApps] = useMutation(EDIT_APP_MUTATION);
  const [deleteAppAndFetchApps] = useMutation(DELETE_APP_MUTATION);

  const [apps, setApps] = useState([]);

  useEffect(() => {
    if (data?.me?.apps) setApps(data.me.apps);
  }, [data]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', redirectUri: '' });
  const [editApp, setEditApp] = useState(null);

  const handleAppAdd = async () => {
    try {
      const { data } = await createAppAndFetchApps({
        variables: { name: newApp.name, redirectUri: newApp.redirectUri },
      });
      setApps(data.app.create.ownerUser.apps);
      setShowAddModal(false);
      setNewApp({ name: '', redirectUri: '' });
    } catch (e) {
      alert('앱 생성 실패: ' + e.message);
    }
  };

  const handleAppEdit = async () => {
    try {
      const { data } = await editAppAndFetchApps({
        variables: {
          appId: Number(editApp.id),
          name: editApp.name,
          redirectUri: editApp.redirectUri,
        },
      });
      setApps(data.app.edit.ownerUser.apps);
      setSelectedApp(null);
      setEditApp(null);
    } catch (e) {
      alert('앱 수정 실패: ' + e.message);
    }
  };

  const handleAppDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { data } = await deleteAppAndFetchApps({
        variables: { appId: Number(id) },
      });
      setApps(data.app.delete.apps);
      setSelectedApp(null);
    } catch (e) {
      alert('앱 삭제 실패: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-10 font-sans">
        <div className="w-full max-w-2xl space-y-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">앱 관리</h1>
            <button
              className="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-gray-400 cursor-not-allowed"
              disabled
            >
              뒤로가기
            </button>
          </div>
          <div>
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
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">앱이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-4">
            <button
              className="px-6 py-2 bg-gray-300 text-white rounded-lg cursor-not-allowed"
              disabled
            >
              앱 추가
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (error) return <div className="text-red-600">앱 목록을 불러오지 못했습니다.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 font-sans">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">앱 관리</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
          >
            뒤로가기
          </button>
        </div>
        <div>
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
              {apps.map(app => (
                <tr key={app.id} className="hover:bg-gray-100">
                  <td className="p-2">{app.name}</td>
                  <td className="p-2 text-center font-mono text-xs">{app.clientId}</td>
                  <td className="p-2 text-center">{app.created?.slice(0, 10)}</td>
                  <td className="p-2 text-center">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => {
                        setSelectedApp(app);
                        setEditApp({ ...app });
                      }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400">앱이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-4">
          <button
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            onClick={() => setShowAddModal(true)}
          >
            앱 추가
          </button>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">앱 상세/수정</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-semibold break-all whitespace-pre-wrap">앱 이름</label>
                <input
                  className="border rounded w-full p-2"
                  value={editApp.name}
                  onChange={e => setEditApp({ ...editApp, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Redirect URI</label>
                <input
                  className="border rounded w-full p-2"
                  value={editApp.redirectUri}
                  onChange={e => setEditApp({ ...editApp, redirectUri: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">클라이언트 ID</label>
                <div className="bg-gray-100 rounded p-2 font-mono text-xs select-all break-all whitespace-pre-wrap">{editApp.clientId}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold">클라이언트 Secret</label>
                <div className="bg-gray-100 rounded p-2 font-mono text-xs select-all break-all whitespace-pre-wrap">{editApp.clientSecret}</div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleAppEdit}
              >
                수정완료
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded"
                onClick={() => handleAppDelete(selectedApp.id)}
              >
                삭제
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => { setSelectedApp(null); setEditApp(null); }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">앱 추가</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-semibold">앱 이름</label>
                <input
                  className="border rounded w-full p-2"
                  value={newApp.name}
                  onChange={e => setNewApp({ ...newApp, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Redirect URI</label>
                <input
                  className="border rounded w-full p-2"
                  value={newApp.redirectUri}
                  onChange={e => setNewApp({ ...newApp, redirectUri: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={handleAppAdd}
                disabled={!newApp.name || !newApp.redirectUri}
              >
                앱 추가
              </button>
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowAddModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
