import { useRef, useState, type SVGProps } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { api } from '@/utils/client/api'
import * as Tabs from '@radix-ui/react-tabs';
/**
 * QUESTION 3:
 * -----------
 * A todo has 2 statuses: "pending" and "completed"
 *  - "pending" state is represented by an unchecked checkbox
 *  - "completed" state is represented by a checked checkbox, darker background,
 *    and a line-through text
 *
 * We have 2 backend apis:
 *  - (1) `api.todo.getAll`       -> a query to get all todos
 *  - (2) `api.todoStatus.update` -> a mutation to update a todo's status
 *
 * Example usage for (1) is right below inside the TodoList component. For (2),
 * you can find similar usage (`api.todo.create`) in src/client/components/CreateTodoForm.tsx
 *
 * If you use VSCode as your editor , you should have intellisense for the apis'
 * input. If not, you can find their signatures in:
 *  - (1) src/server/api/routers/todo-router.ts
 *  - (2) src/server/api/routers/todo-status-router.ts
 *
 * Your tasks are:
 *  - Use TRPC to connect the todos' statuses to the backend apis
 *  - Style each todo item to reflect its status base on the design on Figma
 *
 * Documentation references:
 *  - https://trpc.io/docs/client/react/useQuery
 *  - https://trpc.io/docs/client/react/useMutation
 *
 *
 *
 *
 *
 * QUESTION 4:
 * -----------
 * Implement UI to delete a todo. The UI should look like the design on Figma
 *
 * The backend api to delete a todo is `api.todo.delete`. You can find the api
 * signature in src/server/api/routers/todo-router.ts
 *
 * NOTES:
 *  - Use the XMarkIcon component below for the delete icon button. Note that
 *  the icon button should be accessible
 *  - deleted todo should be removed from the UI without page refresh
 *
 * Documentation references:
 *  - https://www.sarasoueidan.com/blog/accessible-icon-buttons
 *
 *
 *
 *
 *
 * QUESTION 5:
 * -----------
 * Animate your todo list using @formkit/auto-animate package
 *
 * Documentation references:
 *  - https://auto-animate.formkit.com
 */

type Tab = 'completed' | 'pending' | 'all'
const tabs: Tab[] = ['all', 'completed', 'pending']

export const TodoList = () => {
  const [parent] = useAutoAnimate()

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [listStatus, setListStatus] = useState<Array<'completed' | 'pending'>>(['completed', 'pending']);
  const { data: todos = [], refetch: refetchGetAll } = api.todo.getAll.useQuery({ statuses: listStatus });

  const { mutate: updateStatus } = api.todoStatus.update.useMutation({
    onSuccess: () => refetchGetAll()
  })
  const handleUpdateStatus = (id: number, status: 'completed' | 'pending') => {
    updateStatus({ todoId: id, status })
  }

  const handleToggleTodoStatus = (id: number) => {
    const currentStatus = todos.find((todo) => todo.id === id)?.status?? 'pending';
    handleUpdateStatus(id, currentStatus === 'pending'? 'completed' : 'pending');
  }

  const { mutate: deleteTodo } = api.todo.delete.useMutation({
    onSuccess: () => refetchGetAll()
  })

  const handleDeleteTodo = (id: number) => {
    deleteTodo({ id })
  }

  const handleClickTab = (type: Tab) => {
    setActiveTab(type);
    setListStatus(type === 'all' ? ['completed', 'pending'] : [type]);
  }

  return (
    <ul className="grid grid-cols-1 gap-y-[40px]">
      <TabsDemo tabs={tabs} activeTab={activeTab} handleClickTab={handleClickTab} />
      <ul ref={parent}>
        {todos.map((todo) =>{
          const formatTodo = {
            ...todo,
            completed: todo.status === 'completed' 
          }
          return <TodoItem key={todo.id}  todo={formatTodo} handleToggleTodoStatus={handleToggleTodoStatus} handleDeleteTodo={handleDeleteTodo} />
        })}
      </ul>
    </ul>
  )
}

interface TabsProps {
  tabs: Tab[]
  activeTab: Tab
  handleClickTab: (type: Tab) => void
}

const TabsDemo = ({tabs, activeTab, handleClickTab}: TabsProps) => {

  return (
    <Tabs.Root className="TabsRoot" defaultValue={activeTab}>
      <Tabs.List className="TabsList" aria-label={activeTab}>
        {tabs.map((type) => {
          const isActive = activeTab.includes(type)
          return (
            <Tabs.Trigger 
              key={type} 
              className={` border px-6 rounded-full transition-all duration-300 py-3 text-sm font-bold focus:outline-none capitalize mr-2 ${
                isActive
                ? ' text-[#fff] border-[#334155] bg-[#334155]'
                : ' text-[#334155] border-[#E2E8F0] bg-[#ffff] hover:text-[#fff] hover:border-[#334155] hover:bg-[#334155]'
              }`} 
              value={type} 
              onClick={() => handleClickTab(type)}
              >
                {type}
            </Tabs.Trigger>
          )
        })}
      </Tabs.List>
    </Tabs.Root>
  );
}

type TodoItemProps = {
  todo: { id: number; body: string; completed: boolean };
  handleToggleTodoStatus: (id: number) => void;
  handleDeleteTodo: (id: number) => void;
};

const TodoItem = ({ todo, handleToggleTodoStatus,handleDeleteTodo }: TodoItemProps) => {
  const [isChecked, setIsChecked] = useState(todo.completed);

  const handleCheckboxClick = () => {
    setIsChecked(!isChecked);
    handleToggleTodoStatus(todo.id);
  };

  return (
    <li>
      <div className={`${isChecked ? 'bg-[#F8FAFC]': 'bg-white'} flex items-center rounded-12 border border-gray-200 px-4 py-3 shadow-sm`}>
        <Checkbox.Root
          checked={isChecked}
          onClick={handleCheckboxClick}
          id={String(todo.id)}
          className="flex h-6 w-6 items-center justify-center rounded-6 border border-gray-300 focus:border-gray-700 focus:outline-none data-[state=checked]:border-gray-700 data-[state=checked]:bg-gray-700"
        >
          <Checkbox.Indicator>
            <CheckIcon className="h-4 w-4 text-white" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label className={`${isChecked ? 'line-through text-[#64748B]': 'text-[#334155]'} block pl-3 font-medium flex-1`} htmlFor={String(todo.id)}>
          {todo.body}
        </label>
        <button
          onClick={() => handleDeleteTodo(todo.id)}
          className="ml-3 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
        >
          <XMarkIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </li>
  );
};

const XMarkIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  )
}
