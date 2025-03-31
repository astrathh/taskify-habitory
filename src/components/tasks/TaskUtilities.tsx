
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskPriority, TaskStatus } from '@/store/taskStore';

export const getPriorityBadge = (priority: TaskPriority) => {
  switch(priority) {
    case 'alta':
      return <Badge variant="destructive">Alta</Badge>;
    case 'média':
      return <Badge variant="default" className="bg-yellow-500">Média</Badge>;
    case 'baixa':
      return <Badge variant="outline" className="text-green-600">Baixa</Badge>;
    default:
      return <Badge variant="outline">Indefinida</Badge>;
  }
};

export const getStatusBadge = (status: TaskStatus) => {
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

export const getStatusClasses = (status: TaskStatus) => {
  switch(status) {
    case 'concluída':
      return "text-green-600 hover:text-green-700 hover:bg-green-50";
    case 'em progresso':
      return "text-blue-600 hover:text-blue-700 hover:bg-blue-50";
    case 'pendente':
      return "text-gray-600 hover:text-gray-700 hover:bg-gray-50";
    case 'cancelada':
      return "text-red-600 hover:text-red-700 hover:bg-red-50";
    default:
      return "";
  }
};

export const isOverdue = (dueDate: string) => {
  const today = new Date();
  const taskDate = new Date(dueDate);
  return taskDate < today && taskDate.toDateString() !== today.toDateString();
};
