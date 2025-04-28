
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  BarChart,
  Home,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Tarefas',
    url: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Compromissos',
    url: '/appointments',
    icon: Calendar,
  },
  {
    title: 'Hábitos',
    url: '/habits',
    icon: BarChart,
  },
];

const AppSidebar = () => {
  const { user } = useAuthStore();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="py-6 px-4 text-center">
          <img
            src="https://storage.googleapis.com/msgsndr/S7HEFAz97UKuC8NLHMmI/media/680ff53033fee486c04530f8.png"
            alt="Logo RevTasks"
            className="mx-auto h-12"
          />
          <p className="text-sm text-muted-foreground">Gerencie suas tarefas</p>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive ? 'w-full text-primary' : 'w-full'
                      }
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-4 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    isActive ? 'w-full text-primary' : 'w-full'
                  }
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span>Configurações</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <div className="mt-4 px-3 py-2 text-xs text-muted-foreground">
            {user?.email ? (
              <p>Logado como: {user.email}</p>
            ) : (
              <p>Usuário não autenticado</p>
            )}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
