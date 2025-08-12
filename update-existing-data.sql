-- Script para atualizar dados existentes com user_id
-- Execute este script no Supabase para associar dados existentes aos usuários

-- 1. Primeiro, vamos ver quais usuários existem no sistema
SELECT id, email FROM auth.users LIMIT 10;

-- 2. Atualizar clientes existentes (assumindo que o primeiro usuário é o dono)
-- ⚠️ ATENÇÃO: Este é um exemplo. Você deve ajustar o user_id para o usuário correto
UPDATE clients 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- 3. Atualizar vendas existentes (assumindo que o primeiro usuário é o dono)
-- ⚠️ ATENÇÃO: Este é um exemplo. Você deve ajustar o user_id para o usuário correto
UPDATE sales 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- 4. Verificar se foi atualizado
SELECT 
  'clients' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id
FROM clients
UNION ALL
SELECT 
  'sales' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id
FROM sales;

-- 5. Verificar alguns registros para confirmar
SELECT id, name, email, user_id FROM clients LIMIT 5;
SELECT id, client_id, value, date, user_id FROM sales LIMIT 5;
