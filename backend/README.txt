# 1024b-backend
 
Trabalho Integrado - Banco de Dados II e Frameworks I
Integrante(s)
Ana Carolina Corradi, Micaella D. G. Duarte

Tema
Loja LEGO
Banco de Dados
Banco: lego_store
Estrutura do Banco
O sistema possui três tabelas principais:
clientes
produtos
pedidos
As tabelas estão relacionadas por chaves estrangeiras para representar as vendas da loja LEGO.

Funcionalidades
Produtos
Listar produtos;
Filtrar produtos por tema;
Cadastrar produto;
Atualizar produto;
Excluir produto.
Pedidos
Listar pedidos;

Consultas SQL Implementadas
SELECT com WHERE;
INNER JOIN;
LEFT JOIN;
RIGHT JOIN;
GROUP BY;
HAVING;
Subconsulta.

Como Executar
Criar o banco de dados utilizando o arquivo lego_store.sql.
Configurar a conexão com o MySQL no arquivo mysql_connection.ts.
Instalar as dependências:
npm install

Executar o projeto:
cd backend
npm i
npm run dev

cd frontend
npm i
npm run dev

O servidor será iniciado na porta:
http://localhost:8000

