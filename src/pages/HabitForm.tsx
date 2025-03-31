
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useHabitStore } from '@/store/habitStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const HabitForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addHabit } = useHabitStore();
  
  const [name, setName] = useState('');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('vezes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para adicionar um hábito');
      return;
    }
    
    if (!name.trim()) {
      toast.error('O nome do hábito é obrigatório');
      return;
    }
    
    if (target <= 0) {
      toast.error('O objetivo deve ser maior que zero');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addHabit({
        name: name.trim(),
        target,
        unit: unit.trim() || 'vezes'
      });
      
      toast.success('Hábito adicionado com sucesso!');
      navigate('/habits');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Erro ao adicionar hábito');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => navigate('/habits')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Novo Hábito</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Hábito</CardTitle>
          <CardDescription>
            Crie um novo hábito para acompanhar seu progresso
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Hábito</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Beber água"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Objetivo Diário</Label>
                <Input
                  id="target"
                  type="number"
                  min="1"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Ex: vezes, litros, páginas"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => navigate('/habits')}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Hábito
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default HabitForm;
