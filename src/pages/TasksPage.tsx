
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore, Task, TaskPriority, TaskStatus } from '@/store/taskStore';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, Filter, CheckCircle, Clock, AlertCircle, 
  Edit, Trash2, CheckSquare, XSquare, ChevronDown 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, fetchTasks, updateTask, deleteTask, loading } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'todas'>('todas');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'todas'>('todas');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Get priority badge color
  const getPriorityBadge = (priority: TaskPriority) => {
    switch(priority) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'média':
        return <Badge variant="default" className="bg-yellow-500">Média</Badge>;
      case 'baixa':
        return <Badge variant="outline" className="text-green-600">Baixa</Badge>;
      default:
        return <Badge variant="outline">Indefinida</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: TaskStatus) => {
    switch(status) {
      case 'concluída':
        return <Badge variant="default" className="bg-green-600">Concluída</Badge>;
      case 'em progresso':
        return <Badge variant="default" className="bg-blue-600">Em Progresso</Badge>;
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      case 'cancelada':
        return <Badge variant="default" className="bg-red-600">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  // Status colors para o dropdown
  const getStatusClasses = (status: TaskStatus) => {
    switch(status) {
      case 'concluída':
        return "text-green-600 hover:text-green-700 hover:bg-green-50";
      case 'em progresso':
        return "text-blue-600 hover:text-blue-700 hover:bg-blue-50";
      case 'pendente':
        return "text-gray-600 hover:text-gray-700 hover:bg-gray-50";
      case 'cancelada':
        return "text-red-600 hover:text-red-700 hover:bg-red-50";
      default:
        return "";
    }
  };

  // Check if due date is overdue
  const isOverdue = (dueDate: string) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    return taskDate < today && taskDate.toDateString() !== today.toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h1>
        <Button onClick={() => navigate('/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tarefas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Status: {filterStatus === 'todas' ? 'Todas' : filterStatus}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus('todas')}>
              Todas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('pendente')}>
              Pendente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('em progresso')}>
              Em Progresso
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('concluída')}>
              Concluída
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('cancelada')}>
              Cancelada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Prioridade: {filterPriority === 'todas' ? 'Todas' : filterPriority}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterPriority('todas')}>
              Todas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('alta')}>
              Alta
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('média')}>
              Média
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('baixa')}>
              Baixa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
        </div>
      ) : (
        <>
          {filteredTasks.length > 0 ? (
            <Table>
              <TableCaption>Lista de tarefas - Total: {filteredTasks.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Limite</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer hover:bg-muted/80"
                    onClick={() => openTaskModal(task)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.category}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-1">
                          {getStatusBadge(task.status)}
                          <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            className={getStatusClasses('pendente')}
                            onClick={() => handleStatusChange(task.id, 'pendente')}
                          >
                            Pendente
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={getStatusClasses('em progresso')}
                            onClick={() => handleStatusChange(task.id, 'em progresso')}
                          >
                            Em Progresso
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={getStatusClasses('concluída')}
                            onClick={() => handleStatusChange(task.id, 'concluída')}
                          >
                            Concluída
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={getStatusClasses('cancelada')}
                            onClick={() => handleStatusChange(task.id, 'cancelada')}
                          >
                            Cancelada
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className={isOverdue(task.due_date) && task.status !== 'concluída' ? 'text-red-600' : ''}>
                      {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {task.status !== 'concluída' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkComplete(task.id)}
                            title="Marcar como concluída"
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/edit/${task.id}`);
                          }}
                          title="Editar tarefa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task.id);
                          }}
                          title="Excluir tarefa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {searchTerm || filterStatus !== 'todas' || filterPriority !== 'todas' 
                  ? 'Tente ajustar seus filtros de busca' 
                  : 'Adicione sua primeira tarefa para começar'}
              </p>
              {!searchTerm && filterStatus === 'todas' && filterPriority === 'todas' && (
                <Button onClick={() => navigate('/tasks/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal com detalhes da tarefa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Detalhes completos da tarefa
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Categoria</p>
                  <p>{selectedTask.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Prioridade</p>
                  <div>{getPriorityBadge(selectedTask.priority)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <div>{getStatusBadge(selectedTask.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Data Limite</p>
                  <p className={isOverdue(selectedTask.due_date) && selectedTask.status !== 'concluída' ? 'text-red-600' : ''}>
                    {format(new Date(selectedTask.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Descrição</p>
                <p className="text-sm text-muted-foreground">
                  {selectedTask.description || "Nenhuma descrição fornecida."}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Data de Criação</p>
                <p className="text-sm">
                  {format(new Date(selectedTask.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                if (selectedTask) {
                  navigate(`/tasks/edit/${selectedTask.id}`);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
