import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/todos'

function formatDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

async function getErrorMessage(response, fallbackMessage) {
  try {
    const data = await response.json()

    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
}

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editingContent, setEditingContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')

  const isEditing = useMemo(() => Boolean(editingId), [editingId])

  const loadTodos = async (baseUrl) => {
    const response = await fetch(baseUrl, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, '할일 목록을 불러오지 못했습니다.'))
    }

    const data = await response.json()
    setTodos(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true)
        setError('')
        await loadTodos(API_BASE_URL)
      } catch (initError) {
        setError(initError.message)
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()

    if (!newTodo.trim()) {
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newTodo }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, '할일 추가에 실패했습니다.'))
      }

      const createdTodo = await response.json()
      setTodos((previous) => [createdTodo, ...previous])
      setNewTodo('')
    } catch (createError) {
      setError(createError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditingContent(todo.content)
    setError('')
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditingContent('')
  }

  const handleUpdate = async (todoId) => {
    if (!editingContent.trim()) {
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const response = await fetch(`${API_BASE_URL}/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editingContent }),
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, '할일 수정에 실패했습니다.'))
      }

      const updatedTodo = await response.json()
      setTodos((previous) =>
        previous.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo)),
      )
      cancelEdit()
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (todoId) => {
    try {
      setDeletingId(todoId)
      setError('')

      const response = await fetch(`${API_BASE_URL}/${todoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, '할일 삭제에 실패했습니다.'))
      }

      setTodos((previous) => previous.filter((todo) => todo._id !== todoId))

      if (editingId === todoId) {
        cancelEdit()
      }
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <main className="app-shell">
      <section className="todo-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Todo App</p>
            <h1>할일을 관리해보세요</h1>
            <p className="subtitle">추가, 수정, 삭제가 모두 가능한 CRUD 예제입니다.</p>
          </div>
        </div>

        <form className="todo-form" onSubmit={handleCreate}>
          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="새 할일을 입력하세요"
            disabled={submitting || loading}
          />
          <button type="submit" disabled={submitting || loading || !newTodo.trim()}>
            {submitting && !isEditing ? '추가 중...' : '추가'}
          </button>
        </form>

        {error ? <p className="message error">{error}</p> : null}
        {loading ? <p className="message">할일 목록을 불러오는 중입니다...</p> : null}

        {!loading && todos.length === 0 ? (
          <div className="empty-state">
            <p>아직 등록된 할일이 없습니다.</p>
            <span>첫 번째 할일을 추가해보세요.</span>
          </div>
        ) : null}

        <ul className="todo-list">
          {todos.map((todo) => {
            const createdAtLabel = formatDate(todo.createdAt)
            const editingCurrentTodo = editingId === todo._id

            return (
              <li key={todo._id} className="todo-item">
                <div className="todo-content">
                  {editingCurrentTodo ? (
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(event) => setEditingContent(event.target.value)}
                      className="edit-input"
                      disabled={submitting}
                    />
                  ) : (
                    <>
                      <strong>{todo.content}</strong>
                      {createdAtLabel ? <span>{createdAtLabel}</span> : null}
                    </>
                  )}
                </div>

                <div className="todo-actions">
                  {editingCurrentTodo ? (
                    <>
                      <button
                        type="button"
                        className="primary"
                        onClick={() => handleUpdate(todo._id)}
                        disabled={submitting || !editingContent.trim()}
                      >
                        {submitting ? '저장 중...' : '저장'}
                      </button>
                      <button type="button" className="ghost" onClick={cancelEdit} disabled={submitting}>
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="ghost" onClick={() => startEdit(todo)}>
                        수정
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(todo._id)}
                        disabled={deletingId === todo._id}
                      >
                        {deletingId === todo._id ? '삭제 중...' : '삭제'}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </main>
  )
}

export default App
