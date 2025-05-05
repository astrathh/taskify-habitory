
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyTrackableStateProps {
  searchActive: boolean;
}

const EmptyTrackableState: React.FC<EmptyTrackableStateProps> = ({ searchActive }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
      {searchActive ? (
        <>
          <CheckSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 text-center">
            Tente ajustar seus filtros ou criar um novo item
          </p>
        </>
      ) : (
        <>
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 text-center">
            Adicione sua primeira tarefa ou hábito para começar a acompanhar seu progresso
          </p>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate('/tasks/new')} className="bg-cfff00 text-black hover:bg-lime-300">
          <Plus className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
        <Button onClick={() => navigate('/habits/new')} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Novo Hábito
        </Button>
      </div>
    </div>
  );
};

export default EmptyTrackableState;
