
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrackableType } from '@/store/trackableItemStore';
import { TaskStatus, TaskPriority } from '@/store/taskStore';

interface TrackableFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: TrackableType | 'all';
  setFilterType: (type: TrackableType | 'all') => void;
  filterStatus: TaskStatus | 'todas';
  setFilterStatus: (status: TaskStatus | 'todas') => void;
  filterPriority: TaskPriority | 'todas';
  setFilterPriority: (priority: TaskPriority | 'todas') => void;
}

const TrackableFilters: React.FC<TrackableFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="search-input"
        />
      </div>
      
      <div className="grid sm:grid-cols-3 gap-3">
        <Select
          value={filterType}
          onValueChange={(value) => setFilterType(value as TrackableType | 'all')}
        >
          <SelectTrigger className="w-full" data-testid="type-filter">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="task">Tarefas</SelectItem>
            <SelectItem value="habit">Hábitos</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as TaskStatus | 'todas')}
        >
          <SelectTrigger className="w-full" data-testid="status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em progresso">Em progresso</SelectItem>
            <SelectItem value="concluída">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filterPriority}
          onValueChange={(value) => setFilterPriority(value as TaskPriority | 'todas')}
        >
          <SelectTrigger className="w-full" data-testid="priority-filter">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as prioridades</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="média">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TrackableFilters;
