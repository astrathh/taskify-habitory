
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Edit, Star } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrackableItem, useTrackableItemStore } from '@/store/trackableItemStore';
import { useNavigate } from 'react-router-dom';

interface TrackableItemDetailProps {
  item: TrackableItem;
  isOpen: boolean;
  onClose: () => void;
}

const TrackableItemDetail: React.FC<TrackableItemDetailProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const { completeItem, skipItem, deleteItem } = useTrackableItemStore();
  const navigate = useNavigate();
  
  const handleComplete = async () => {
    if (item.isCompleted) return;
    await completeItem(item);
    onClose();
  };
  
  const handleSkip = async () => {
    if (item.isCompleted) return;
    await skipItem(item);
    onClose();
  };
  
  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir este ${item.type === 'task' ? 'tarefa' : 'hábito'}?`)) {
      await deleteItem(item);
      onClose();
    }
  };
  
  const handleEdit = () => {
    if (item.type === 'task') {
      navigate(`/tasks/edit/${item.id}`);
    } else {
      // Navigate to habit edit page if it exists
      // For now just close the modal
      onClose();
    }
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'concluída':
        return <Badge variant="default" className="bg-green-600">Concluída</Badge>;
      case 'em progresso':
        return <Badge variant="default" className="bg-blue-600">Em Progresso</Badge>;
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      case 'cancelada':
        return <Badge variant="default" className="bg-red-600">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item.type === 'task' ? 'Detalhes da Tarefa' : 'Detalhes do Hábito'}</DialogTitle>
          <DialogDescription>
            {item.type === 'task' 
              ? 'Visualize ou gerencie esta tarefa'
              : 'Visualize ou gerencie este hábito'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <div className="flex space-x-2 mt-1">
                <Badge variant="outline" className={item.type === 'task' ? 'bg-purple-100' : 'bg-lime-100'}>
                  {item.type === 'task' ? 'Tarefa' : 'Hábito'}
                </Badge>
                {getStatusBadge(item.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {item.dueDate && (
                <div>
                  <p className="text-sm font-medium">Prazo:</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}
              
              {item.category && (
                <div>
                  <p className="text-sm font-medium">Categoria:</p>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              )}
              
              {item.type === 'habit' && item.target && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Progresso:</p>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{item.current} / {item.target} {item.unit}</span>
                      <span>{Math.round((item.current! / item.target) * 100)}%</span>
                    </div>
                    <Progress value={Math.round((item.current! / item.target) * 100)} className="h-2" />
                  </div>
                </div>
              )}
              
              {item.type === 'habit' && item.streak !== undefined && (
                <div className="flex items-center">
                  <p className="text-sm font-medium mr-2">Sequência:</p>
                  <div className="flex items-center text-amber-500">
                    <Star className="h-4 w-4 mr-1" />
                    <span>{item.streak}</span>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Separator />
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleSkip}
            disabled={item.isCompleted}
          >
            <X className="h-4 w-4 mr-2" />
            Pular
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleComplete}
            disabled={item.isCompleted}
          >
            <Check className="h-4 w-4 mr-2" />
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrackableItemDetail;
