import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export default function Sessions() {
  const queryClient = useQueryClient()
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions/me').then(res => res.data),
  })

  const revokeMut = useMutation({
    mutationFn: (sessionId) => api.delete(`/sessions/me/${sessionId}`),
    onSuccess: () => queryClient.invalidateQueries('sessions')
  })

  const revokeAllMut = useMutation({
    mutationFn: () => api.post('/sessions/me/revoke-all'),
    onSuccess: () => { queryClient.invalidateQueries('sessions'); alert('All sessions revoked. You will be logged out.'); window.location.href = '/login'; }
  })

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
      <button onClick={() => revokeAllMut.mutate()} className="bg-red-500 text-white px-3 py-1 rounded mb-4">Revoke All Other Sessions</button>
      {isLoading && <p>Loading...</p>}
      {sessions?.map(s => (
        <div key={s.sessionId} className="border p-2 mb-2 flex justify-between items-center">
          <div>
            <p className="text-sm">Created: {new Date(s.createdAt).toLocaleString()}</p>
            <p className="text-sm">Expires: {new Date(s.expiresAt).toLocaleString()}</p>
          </div>
          <button onClick={() => revokeMut.mutate(s.sessionId)} className="bg-gray-300 px-2 py-1 rounded text-sm">Revoke</button>
        </div>
      ))}
    </div>
  )
}
