'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight text-gray-900">
          Bem-vindo ao Toy Store Admin
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gerencie clientes e visualize estatísticas da sua loja de brinquedos de forma simples e eficiente
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <CardTitle className="text-lg">Gerenciar Clientes</CardTitle>
            <CardDescription>
              Adicione, edite e visualize todos os clientes da loja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/clientes">
                Ver Clientes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <CardTitle className="text-lg">Visualizar Estatísticas</CardTitle>
            <CardDescription>
              Acompanhe vendas e métricas de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/estatisticas">
                Ver Estatísticas
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <CardTitle className="text-lg">Registrar Vendas</CardTitle>
            <CardDescription>
              Cadastre novas vendas para os clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/vendas">
                Nova Venda
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Informações da Conta</CardTitle>
          <CardDescription>
            Detalhes da sua conta de administrador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">E-mail</p>
              <p className="text-lg text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                Ativo
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-blue-600">0</div>
          <div className="text-sm text-gray-600">Clientes</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-green-600">0</div>
          <div className="text-sm text-gray-600">Vendas</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-purple-600">R$ 0</div>
          <div className="text-sm text-gray-600">Total</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-sm text-gray-600">Dias</div>
        </Card>
      </div>
    </div>
  );
}
