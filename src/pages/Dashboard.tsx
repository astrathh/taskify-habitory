import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, BarChart3, AlertCircle, Clock, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskStore } from '@/store/taskStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useHabitStore } from '@/store/habitStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import TasksCharts from '@/components/dashboard/TasksCharts';
import AppointmentsCharts from '@/components/dashboard/AppointmentsCharts';
import HabitsCharts from '@/components/dashboard/HabitsCharts';

// Helper function to get current month name
const getCurrentMonth = () => {
  return new Date().toLocaleString('pt-BR', { month: 'long' });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const { monthlyProgress, createMonthlyProgress, setCurrentMonth, fetchHabits } = useHabitStore();
  const { 
    addNotification, 
    fetchNotifications, 
    initialNotificationSent,
    setInitialNotificationSent 
  } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState<string>("tasks");

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchAppointments();
      fetchNotifications();
      fetchHabits();
    }
  }, [user, fetchTasks, fetchAppointments, fetchNotifications, fetchHabits]);

  // Initialize current month for habits if needed
  useEffect(() => {
    if (user?.id) {
      const currentMonth = getCurrentMonth();
      const hasCurrentMonth = monthlyProgress.some(
        (progress) => progress.month === currentMonth
      );
      
      if (!hasCurrentMonth) {
        createMonthlyProgress(currentMonth, user.id);
      }
      
      setCurrentMonth(currentMonth);
    }
  }, [user, createMonthlyProgress, monthlyProgress, setCurrentMonth]);

  // Send a welcome notification only for new users 
  useEffect(() => {
    // Só adiciona notificação de boas-vindas se o usuário existir, não tiver nenhuma tarefa
    // e ainda não tiver recebido a notificação inicial
    if (user && tasks.length === 0 && !initialNotificationSent) {
      addNotification({
        user_id: user.id,
        message: 'Bem-vindo ao RevTasks! Comece adicionando suas tarefas.',
        type: 'system',
      }).then(() => {
        // Marcar que a notificação inicial já foi enviada
        setInitialNotificationSent(true);
      });
    }
  }, [user, tasks.length, initialNotificationSent, addNotification, setInitialNotificationSent]);

  // Verificar tarefas vencidas
  useEffect(() => {
    if (user && tasks.length > 0) {
      const today = new Date();
      
      // Filtrar tarefas vencidas que estão pendentes
      const overdueTasks = tasks.filter((task) => {
        const dueDate = new Date(task.due_date);
        return (
          task.status !== 'concluída' && 
          dueDate < today && 
          dueDate.toDateString() !== today.toDateString()
        );
      });
      
      // Notificar sobre tarefas vencidas (limitando a não enviar notificações repetidas)
      if (overdueTasks.length > 0) {
        addNotification({
          user_id: user.id,
          message: `Você tem ${overdueTasks.length} tarefa(s) vencida(s)`,
          type: 'task',
        });
      }
    }
  }, [user, tasks, addNotification]);

  // Task metrics
  const pendingTasks = tasks.filter((task) => task.status === 'pendente').length;
  const completedTasks = tasks.filter((task) => task.status === 'concluída').length;
  const highPriorityTasks = tasks.filter((task) => task.priority === 'alta' && task.status !== 'concluída').length;
  
  // Get upcoming appointments (next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= today && appointmentDate <= nextWeek;
  });

  // Get current month's habit progress
  const currentMonth = getCurrentMonth();
  const currentMonthProgress = monthlyProgress.find(
    (progress) => progress.month === currentMonth
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu painel de controle, {user?.user_metadata?.name || user?.email || 'usuário'}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/tasks/new')} data-testid="new-task-button">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
          <Button onClick={() => navigate('/appointments/new')} variant="outline" data-testid="new-appointment-button">
            <Plus className="h-4 w-4 mr-2" />
            Novo Compromisso
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} tarefas concluídas
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: tasks.length > 0 ? `${Math.round((completedTasks / tasks.length) * 100)}%` : '0%' }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compromissos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Agendados para próximos 7 dias
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso de Hábitos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMonthProgress?.overall || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthProgress?.habits.length || 0} hábitos em {currentMonth}
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${currentMonthProgress?.overall || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prioridade Alta</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tarefas pendentes de prioridade alta
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="appointments">Compromissos</TabsTrigger>
          <TabsTrigger value="habits">Hábitos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <TasksCharts />
          
          <Card>
            <CardHeader>
              <CardTitle>Tarefas Recentes</CardTitle>
              <CardDescription>
                As últimas tarefas que você adicionou
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => navigate(`/tasks`)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.priority === 'alta'
                              ? 'bg-destructive'
                              : task.priority === 'média'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        />
                        <div>
                          <p className={`text-sm ${task.status === 'concluída' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.category} • Vence em{' '}
                            {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'concluída'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : task.status === 'em progresso'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : task.status === 'cancelada'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                  
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={() => navigate('/tasks')}>
                      Ver todas as tarefas
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">Nenhuma tarefa ainda</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Adicione suas primeiras tarefas para começar
                  </p>
                  <Button onClick={() => navigate('/tasks/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Tarefa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments">
          <AppointmentsCharts />
        </TabsContent>
        
        <TabsContent value="habits">
          <HabitsCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
