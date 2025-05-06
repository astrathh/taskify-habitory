
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrackableItemStore } from '@/store/trackableItemStore';
import TrackableItemList from '@/components/trackable/TrackableItemList';
import WeeklyProgressChart from '@/components/trackable/WeeklyProgressChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, BarChart2, LayoutList } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';

const TrackablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, loadAllItems } = useTrackableItemStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    if (user) {
      loadAllItems();
    }
  }, [user, loadAllItems]);

  const handleAddNew = (type: 'task' | 'habit') => {
    if (type === 'task') {
      navigate('/tasks/new');
    } else {
      navigate('/habits/new');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus Itens</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Novo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Escolha o tipo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleAddNew('task')}>
                Nova Tarefa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddNew('habit')}>
                Novo Hábito
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">
              <LayoutList className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <BarChart2 className="h-4 w-4 mr-2" />
              Análise
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'list' && (
            <div className="flex space-x-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar..."
                  className="w-[200px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="task">Tarefas</SelectItem>
                  <SelectItem value="habit">Hábitos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em progresso">Em Progresso</SelectItem>
                  <SelectItem value="concluída">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <TabsContent value="list" className="mt-6">
          <TrackableItemList 
            filterStatus={filterStatus} 
            filterType={filterType as any}
            searchTerm={searchTerm}
          />
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-6">
          <WeeklyProgressChart items={items} weeksToShow={4} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackablePage;
