
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, InfoIcon, Star } from 'lucide-react';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { TrackableItem, useTrackableItemStore } from '@/store/trackableItemStore';
import TrackableItemDetail from './TrackableItemDetail';

interface TrackableItemListProps {
  filterStatus?: string;
  filterType?: 'task' | 'habit' | 'all';
  searchTerm?: string;
}

const TrackableItemList: React.FC<TrackableItemListProps> = ({
  filterStatus = 'all',
  filterType = 'all',
  searchTerm = '',
}) => {
  const { items, loadAllItems, completeItem, skipItem } = useTrackableItemStore();
  const [selectedItem, setSelectedItem] = useState<TrackableItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadAllItems();
  }, [loadAllItems]);
  
  // Filter items based on props
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesType = filterType === 'all' || item.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleItemClick = (item: TrackableItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const handleComplete = async (e: React.MouseEvent, item: TrackableItem) => {
    e.stopPropagation();
    
    if (item.isCompleted) {
      toast({
        title: "Item já concluído",
        description: "Este item já foi marcado como concluído.",
        variant: "default",
      });
      return;
    }
    
    await completeItem(item);
  };
  
  const handleSkip = async (e: React.MouseEvent, item: TrackableItem) => {
    e.stopPropagation();
    
    if (item.isCompleted) {
      toast({
        title: "Item já concluído",
        description: "Não é possível pular um item já concluído.",
        variant: "default",
      });
      return;
    }
    
    await skipItem(item);
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
  
  // Render progress bar for habits
  const renderProgress = (item: TrackableItem) => {
    if (item.type !== 'habit' || !item.target) return null;
    
    const percentage = Math.min(Math.round((item.current! / item.target) * 100), 100);
    
    return (
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground flex justify-between">
          <span>{item.current} / {item.target} {item.unit}</span>
          <span>{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    );
  };
  
  // Render streak indicator for habits
  const renderStreak = (item: TrackableItem) => {
    if (item.type !== 'habit' || !item.streak) return null;
    
    return (
      <div className="flex items-center text-amber-500">
        <Star className="h-4 w-4 mr-1" />
        <span className="text-xs">{item.streak}</span>
      </div>
    );
  };
  
  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <InfoIcon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {searchTerm 
            ? "Tente ajustar os filtros ou termos de busca" 
            : "Adicione tarefas ou hábitos para começar a acompanhar seu progresso"}
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>Lista de itens - Total: {filteredItems.length}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow 
              key={`${item.type}-${item.id}`} 
              className="cursor-pointer hover:bg-muted/80"
              onClick={() => handleItemClick(item)}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  {item.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      Prazo: {format(new Date(item.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={item.type === 'task' ? 'bg-purple-100' : 'bg-lime-100'}>
                  {item.type === 'task' ? 'Tarefa' : 'Hábito'}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {renderProgress(item)}
                  {renderStreak(item)}
                </div>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={(e) => handleComplete(e, item)}
                    disabled={item.isCompleted}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Concluir</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => handleSkip(e, item)}
                    disabled={item.isCompleted}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Pular</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedItem && (
        <TrackableItemDetail
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default TrackableItemList;
