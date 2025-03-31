
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskStatus, TaskPriority } from '@/store/taskStore';

interface TaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: TaskStatus | 'todas';
  setFilterStatus: (status: TaskStatus | 'todas') => void;
  filterPriority: TaskPriority | 'todas';
  setFilterPriority: (priority: TaskPriority | 'todas') => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
}) => {
  return (
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
  );
};

export default TaskFilters;
