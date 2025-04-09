// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
import { gql, useMutation } from '@apollo/client'
import { useAuthQuery } from '@nhost/react-apollo'
import { Check, Info, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function Todos() {
  const { data, refetch: refetchTodos } = useAuthQuery(gql`
    query {
      todos(order_by: { created_at: desc }) {
        id
        contents
      }
    }
  `)

  const [contents, setContents] = useState('')

  const [addTodo] = useMutation(gql`
    mutation ($contents: String!) {
      insert_todos(objects: { contents: $contents }) {
        returning {
          id
          contents
        }
      }
    }
  `);
  

  const [deleteTodo] = useMutation(gql`
    mutation deleteTodo($todoId: uuid!) {
      deleteTodo(id: $todoId) {
        id
        contents
      }
    }
  `)

  const handleAddTodo = () => {
    if (contents) {
      addTodo({
        variables: { contents },
        onCompleted: async () => {
          setContents('')
          await refetchTodos()
        },
        onError: (error) => {
          toast.error(error.message)
        }
      })
    }
  }

  const handleDeleteTodo = async (todoId) => {
    await deleteTodo({
      variables: { todoId },
      onCompleted: async () => {
        await refetchTodos()
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })

    await refetchTodos()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              My Todo List
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep track of your tasks and stay organized
            </p>
          </div>

          {/* Add Todo Form */}
          <div className="flex gap-3 mb-8">
            <input
              className="flex-1 min-w-0 rounded-md border-gray-300 shadow-sm px-4 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a new todo..."
              value={contents}
              onChange={(e) => setContents(e.target.value)}
              onKeyDown={(e) => e.code === 'Enter' && handleAddTodo()}
            />
            <button
              onClick={handleAddTodo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>

          {/* Todo List */}
          <div className="space-y-2">
            {data?.todos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Info className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No todos yet</h3>
                <p className="text-gray-500">Start by adding your first todo above</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data?.todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between py-3 group hover:bg-gray-50 rounded-lg px-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-gray-900">{todo.contents}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-full transition-all duration-200"
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
