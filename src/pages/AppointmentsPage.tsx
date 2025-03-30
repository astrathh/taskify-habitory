
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAppointmentStore, Appointment } from '@/store/appointmentStore';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Plus, Search, Filter, Calendar, Clock, MapPin, 
  Bell, BellOff, Edit, Trash2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appointments, fetchAppointments, updateAppointment, deleteAppointment, loading } = useAppointmentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<'todos' | 'hoje' | 'semana' | 'futuro'>('todos');

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

  const handleToggleReminder = async (appointmentId: string, currentReminder: boolean) => {
    try {
      await updateAppointment(appointmentId, { reminder: !currentReminder });
      toast.success(`Lembrete ${!currentReminder ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao atualizar lembrete');
      console.error('Error updating appointment:', error);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    if (confirm('Tem certeza que deseja excluir este compromisso?')) {
      try {
        await deleteAppointment(appointmentId);
        toast.success('Compromisso excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir compromisso');
        console.error('Error deleting appointment:', error);
      }
    }
  };

  // Filter appointments by date
  const getFilteredAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      const matchesSearch = 
        appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.location && appointment.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;
      
      switch (filterDate) {
        case 'hoje':
          return appointmentDate.toDateString() === today.toDateString();
        case 'semana':
          return appointmentDate >= today && appointmentDate < nextWeek;
        case 'futuro':
          return appointmentDate >= today;
        default:
          return true;
      }
    });
  };

  const filteredAppointments = getFilteredAppointments();

  // Format date for display
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'dd/MM/yyyy', { locale: ptBR }),
      time: format(date, 'HH:mm', { locale: ptBR }),
      day: format(date, 'EEEE', { locale: ptBR }),
      isPast: date < new Date()
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Meus Compromissos</h1>
        <Button onClick={() => navigate('/appointments/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Compromisso
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar compromissos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Data: {filterDate === 'todos' ? 'Todos' : 
                     filterDate === 'hoje' ? 'Hoje' : 
                     filterDate === 'semana' ? 'Esta semana' : 'Futuros'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterDate('todos')}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDate('hoje')}>
              Hoje
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDate('semana')}>
              Esta semana
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterDate('futuro')}>
              Futuros
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
          {filteredAppointments.length > 0 ? (
            <Table>
              <TableCaption>Lista de compromissos - Total: {filteredAppointments.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Lembrete</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const { date, time, day, isPast } = formatAppointmentDate(appointment.date);
                  return (
                    <TableRow key={appointment.id} className={isPast ? 'opacity-60' : ''}>
                      <TableCell className="font-medium">{appointment.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{date}</span>
                          <span className="text-xs text-muted-foreground capitalize">{day}</span>
                        </div>
                      </TableCell>
                      <TableCell>{time}</TableCell>
                      <TableCell>{appointment.location || '-'}</TableCell>
                      <TableCell>
                        {appointment.reminder ? (
                          <Badge variant="outline" className="text-green-600 bg-green-50">
                            <Bell className="h-3 w-3 mr-1" /> Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <BellOff className="h-3 w-3 mr-1" /> Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleReminder(appointment.id, !!appointment.reminder)}
                            title={appointment.reminder ? "Desativar lembrete" : "Ativar lembrete"}
                          >
                            {appointment.reminder ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/appointments/edit/${appointment.id}`)}
                            title="Editar compromisso"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(appointment.id)}
                            title="Excluir compromisso"
                          >
                            <Trash2 className="h-4 w-4" />
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
              <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-lg font-medium">Nenhum compromisso encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {searchTerm || filterDate !== 'todos' 
                  ? 'Tente ajustar seus filtros de busca' 
                  : 'Adicione seu primeiro compromisso para começar'}
              </p>
              {!searchTerm && filterDate === 'todos' && (
                <Button onClick={() => navigate('/appointments/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Compromisso
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentsPage;
