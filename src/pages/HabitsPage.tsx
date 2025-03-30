
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useHabitStore } from '@/store/habitStore';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, Calendar, BarChart3, CheckCircle2, XCircle,
  ArrowUp, ArrowDown, CalendarRange 
} from 'lucide-react';
import { toast } from 'sonner';

interface Habit {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  streak: number;
}

const HabitsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { monthlyProgress, currentMonth, fetchHabits, updateHabitProgress, loading } = useHabitStore();
  
  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user, fetchHabits]);

  const currentMonthData = monthlyProgress.find(p => p.month === currentMonth) || { 
    month: currentMonth, 
    habits: [], 
    overall: 0,
    user_id: user?.id || '',
    id: ''
  };
  
  const habits = currentMonthData.habits as unknown as Habit[] || [];

  const handleIncrement = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      const newCurrent = Math.min(habit.current + 1, habit.target);
      
      // Clone the habits array and update the specific habit
      const updatedHabits = habits.map(h => 
        h.id === habitId ? { ...h, current: newCurrent } : h
      );
      
      // Calculate new overall progress
      const totalProgress = updatedHabits.reduce((acc, h) => {
        const habitProgress = Math.min((h.current / h.target) * 100, 100);
        return acc + habitProgress;
      }, 0);
      
      const newOverall = Math.round(totalProgress / (updatedHabits.length || 1));
      
      await updateHabitProgress(currentMonthData.id, updatedHabits, newOverall);
      toast.success('Progresso atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar progresso');
      console.error('Error updating habit progress:', error);
    }
  };
  
  const handleDecrement = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      const newCurrent = Math.max(habit.current - 1, 0);
      
      // Clone the habits array and update the specific habit
      const updatedHabits = habits.map(h => 
        h.id === habitId ? { ...h, current: newCurrent } : h
      );
      
      // Calculate new overall progress
      const totalProgress = updatedHabits.reduce((acc, h) => {
        const habitProgress = Math.min((h.current / h.target) * 100, 100);
        return acc + habitProgress;
      }, 0);
      
      const newOverall = Math.round(totalProgress / (updatedHabits.length || 1));
      
      await updateHabitProgress(currentMonthData.id, updatedHabits, newOverall);
      toast.success('Progresso atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar progresso');
      console.error('Error updating habit progress:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Hábitos</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso em {currentMonth}
          </p>
        </div>
        <Button onClick={() => navigate('/habits/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Hábito
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentMonthData.overall}%</div>
            <Progress value={currentMonthData.overall} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hábitos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{habits.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {habits.filter(h => h.current >= h.target).length} hábitos concluídos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mês Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">{currentMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <CalendarRange className="inline h-3 w-3 mr-1" />
              Acompanhamento mensal
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent" />
        </div>
      ) : (
        <>
          {habits.length > 0 ? (
            <Table>
              <TableCaption>Lista de hábitos - {currentMonth}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Sequência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {habits.map((habit) => {
                  const progress = Math.min((habit.current / habit.target) * 100, 100);
                  const isComplete = habit.current >= habit.target;
                  
                  return (
                    <TableRow key={habit.id}>
                      <TableCell className="font-medium">{habit.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs">
                            <span>{habit.current} / {habit.target} {habit.unit}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{habit.streak}</span>
                          <span className="text-xs text-muted-foreground">dias</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isComplete ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            <span>Concluído</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-muted-foreground">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span>Em progresso</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleIncrement(habit.id)}
                            disabled={habit.current >= habit.target}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDecrement(habit.id)}
                            disabled={habit.current <= 0}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Nenhum hábito encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Adicione seu primeiro hábito para começar a acompanhar seu progresso
              </p>
              <Button onClick={() => navigate('/habits/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Hábito
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HabitsPage;
