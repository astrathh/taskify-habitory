
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plus } from 'lucide-react';

interface EmptyTaskStateProps {
  searchActive: boolean;
}

const EmptyTaskState: React.FC<EmptyTaskStateProps> = ({ searchActive }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
      <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {searchActive 
          ? 'Tente ajustar seus filtros de busca' 
          : 'Adicione sua primeira tarefa para começar'}
      </p>
      {!searchActive && (
        <Button onClick={() => navigate('/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Tarefa
        </Button>
      )}
    </div>
  );
};

export default EmptyTaskState;
