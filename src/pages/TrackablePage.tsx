
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTrackableItemStore, TrackableItem, TrackableType } from '@/store/trackableItemStore';
import { TaskPriority, TaskStatus } from '@/store/taskStore';
import { toast } from 'sonner';

// Unified trackable components
import TrackableItemList from '@/components/trackable/TrackableItemList';
import EmptyTrackableState from '@/components/trackable/EmptyTrackableState';
import TrackableFilters from '@/components/trackable/TrackableFilters';
import TrackableItemDetail from '@/components/trackable/TrackableItemDetail';
import WeeklyProgressChart from '@/components/trackable/WeeklyProgressChart';

import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Clock } from 'lucide-react';

const TrackablePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, fetchItems, loading, completeItem, skipItem } = useTrackableItemStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TrackableType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'todas'>('todas');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'todas'>('todas');
  
  const [selectedItem, setSelectedItem] = useState<TrackableItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, fetchItems]);

  // Filter and search items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    
    // Handle status filtering
    const matchesStatus = filterStatus === 'todas' || (() => {
      if (filterStatus === 'concluída') {
        return item.status === 'concluída' || item.status === 'completed';
      }
      if (filterStatus === 'cancelada') {
        return item.status === 'cancelada' || item.status === 'skipped';
      }
      if (filterStatus === 'em progresso') {
        return item.status === 'em progresso' || item.status === 'in_progress';
      }
      return item.status === filterStatus;
    })();
    
    // Handle priority filtering, only apply to tasks
    const matchesPriority = 
      filterPriority === 'todas' || 
      (item.type === 'task' && item.priority === filterPriority);
    
    return matchesSearch && matchesType && matchesStatus && 
      (filterPriority === 'todas' || matchesPriority);
  });

  const handleComplete = async (itemId: string) => {
    try {
      await completeItem(itemId);
    } catch (error) {
      toast.error('Erro ao concluir item');
      console.error('Error completing item:', error);
    }
  };

  const handleSkip = async (itemId: string) => {
    try {
      await skipItem(itemId);
    } catch (error) {
      toast.error('Erro ao pular item');
      console.error('Error skipping item:', error);
    }
  };

  const handleItemClick = (item: TrackableItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string, type: string) => {
    if (type === 'task') {
      navigate(`/tasks/edit/${id}`);
    } else if (type === 'habit') {
      navigate(`/habits/edit/${id}`);
    }
  };

  // Separate items into today's items and future items for better organization
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysItems = filteredItems.filter(item => {
    if (item.type === 'habit') return true; // Habits are always for today
    
    if (item.dueDate) {
      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate <= today;
    }
    
    return false;
  });
  
  const futureItems = filteredItems.filter(item => {
    if (item.type === 'habit') return false; // Habits are always for today
    
    if (item.dueDate) {
      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate > today;
    }
    
    return false;
  });

  // Fix the type issue by ensuring isSearchActive is always a boolean
  const isSearchActive = Boolean(searchTerm) || filterStatus !== 'todas' || filterPriority !== 'todas' || filterType !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas & Hábitos</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e hábitos diários
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/tasks/new')}
            className="bg-cfff00 text-black hover:bg-lime-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
          <Button 
            onClick={() => navigate('/habits/new')} 
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Hábito
          </Button>
        </div>
      </div>

      {/* Weekly progress chart */}
      <WeeklyProgressChart items={items} />
      
      <TrackableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-cfff00 rounded-full border-t-transparent" />
        </div>
      ) : (
        <>
          {filteredItems.length > 0 ? (
            <div className="space-y-8">
              {/* Today's items section */}
              {todaysItems.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-cfff00" />
                    <h2 className="text-xl font-bold">Para hoje</h2>
                  </div>
                  <TrackableItemList
                    items={todaysItems}
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                    onItemClick={handleItemClick}
                  />
                </div>
              )}
              
              {/* Future items section */}
              {futureItems.length > 0 && (
                <div>
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h2 className="text-xl font-bold">Próximos</h2>
                  </div>
                  <TrackableItemList
                    items={futureItems}
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                    onItemClick={handleItemClick}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyTrackableState searchActive={isSearchActive} />
          )}
        </>
      )}

      <TrackableItemDetail
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={handleEdit}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
};

export default TrackablePage;
