
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore, Task, TaskPriority, TaskStatus } from '@/store/taskStore';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Componentes refatorados
import TaskHeader from '@/components/tasks/TaskHeader';
import TaskFilters from '@/components/tasks/TaskFilters';
import TaskList from '@/components/tasks/TaskList';
import EmptyTaskState from '@/components/tasks/EmptyTaskState';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import WeeklyProgressChart from '@/components/tasks/WeeklyProgressChart';
import { 
  getPriorityBadge, 
  getStatusBadge,
  getStatusClasses,
  isOverdue
} from '@/components/tasks/TaskUtilities';

const TasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, fetchTasks, updateTask, deleteTask, loading } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'todas'>('todas');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'todas'>('todas');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  const handleMarkComplete = async (taskId: string) => {
    try {
      await updateTask(taskId, { status: 'concluída' });
      toast.success('Tarefa marcada como concluída!');
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask(taskId);
        toast.success('Tarefa excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir tarefa');
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success(`Status atualizado para: ${newStatus}`);
    } catch (error) {
      toast.error('Erro ao atualizar status');
      console.error('Error updating task status:', error);
    }
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todas' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'todas' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Fix the type error by ensuring isSearchActive is always a boolean
  const isSearchActive = Boolean(searchTerm) || filterStatus !== 'todas' || filterPriority !== 'todas';

  return (
    <div className="space-y-6">
      <TaskHeader />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-xs mb-4">
          <TabsTrigger value="list">Lista de tarefas</TabsTrigger>
          <TabsTrigger value="progress">Análise Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <TaskFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
          />

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
            </div>
          ) : (
            <>
              {filteredTasks.length > 0 ? (
                <TaskList 
                  tasks={filteredTasks}
                  isOverdue={isOverdue}
                  getPriorityBadge={getPriorityBadge}
                  getStatusBadge={getStatusBadge}
                  getStatusClasses={getStatusClasses}
                  handleStatusChange={handleStatusChange}
                  handleMarkComplete={handleMarkComplete}
                  handleDelete={handleDelete}
                  openTaskModal={openTaskModal}
                  navigate={navigate}
                />
              ) : (
                <EmptyTaskState searchActive={isSearchActive} />
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="progress">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
            </div>
          ) : (
            tasks.length > 0 ? (
              <WeeklyProgressChart tasks={tasks} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card">
                <p className="mb-4 text-lg">Adicione tarefas para visualizar o progresso semanal</p>
                <button 
                  className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90"
                  onClick={() => navigate('/tasks/new')}
                >
                  Adicionar tarefa
                </button>
              </div>
            )
          )}
        </TabsContent>
      </Tabs>

      <TaskDetailModal 
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        getPriorityBadge={getPriorityBadge}
        getStatusBadge={getStatusBadge}
        isOverdue={isOverdue}
        onEdit={(id) => navigate(`/tasks/edit/${id}`)}
      />
    </div>
  );
};

export default TasksPage;
