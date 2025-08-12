'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const AuthSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type AuthForm = z.infer<typeof AuthSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<AuthForm>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AuthForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = isSignUp 
        ? await signUp(data.email, data.password)
        : await signIn(data.email, data.password);

      if (error) {
        setError(error.message);
        return;
      }

      if (isSignUp) {
        setError('Verifique seu e-mail para confirmar a conta!');
        setIsSignUp(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold tracking-tight transition-colors duration-200 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Toy Store Admin
          </h1>
          <p className={`transition-colors duration-200 ${
            theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
          }`}>
            {isSignUp ? 'Crie sua conta para começar' : 'Entre na sua conta'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className={`shadow-xl border-0 backdrop-blur-sm transition-colors duration-200 ${
          theme === 'dark' 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white/80'
        }`}>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className={`text-2xl text-center transition-colors duration-200 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </CardTitle>
            <CardDescription className={`text-center transition-colors duration-200 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {isSignUp 
                ? 'Preencha os dados abaixo para criar sua conta' 
                : 'Digite suas credenciais para acessar o sistema'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
                        E-mail
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="seu@email.com"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={theme === 'dark' ? 'text-slate-200' : ''}>
                        Senha
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className={`p-3 rounded-lg border transition-colors duration-200 ${
                    error.includes('Verifique seu e-mail') 
                      ? theme === 'dark'
                        ? 'bg-green-900/20 border-green-700 text-green-300'
                        : 'bg-green-50 border-green-200 text-green-700'
                      : theme === 'dark'
                        ? 'bg-red-900/20 border-red-700 text-red-300'
                        : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isSignUp ? 'Criando conta...' : 'Entrando...'}</span>
                    </div>
                  ) : (
                    isSignUp ? 'Criar Conta' : 'Entrar'
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <Separator className={`my-4 ${
                theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'
              }`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`px-4 text-sm transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-white text-gray-500'
                }`}>
                  ou
                </span>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsSignUp(!isSignUp)}
                className={`transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:text-blue-300 hover:bg-slate-700'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
              </Button>
            </div>

            {!isSignUp && (
              <div className="text-center">
                <p className={`text-xs transition-colors duration-200 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  Para testar o sistema, crie uma conta primeiro
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs transition-colors duration-200 ${
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          }`}>
            Sistema de administração para loja de brinquedos
          </p>
        </div>
      </div>
    </div>
  );
}


