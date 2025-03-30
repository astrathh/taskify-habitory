
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Processa o callback de autenticação OAuth
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro no callback de autenticação:', error);
      }
      
      // Independentemente do resultado, navegue para a home
      navigate('/', { replace: true });
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Autenticando...</h2>
        <p className="text-muted-foreground">Você será redirecionado em instantes.</p>
        <div className="mt-4">
          <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
