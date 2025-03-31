
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const TaskHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h1>
      <Button onClick={() => navigate('/tasks/new')}>
        <Plus className="h-4 w-4 mr-2" />
        Nova Tarefa
      </Button>
    </div>
  );
};

export default TaskHeader;
