 

//<--! SELECT + WHERE
SELECT *
FROM produtos
WHERE tema='Star Wars';


SELECT
  c.nome AS cliente,
  p.nome AS produto,
  ped.quantidade,
  ped.valor_total
FROM pedidos ped
INNER JOIN clientes c
  ON ped.id_cliente = c.id_cliente
INNER JOIN produtos p
  ON ped.id_produto = p.id_produto;
--!INNER JOIN

SELECT
  produtos.nome,
  pedidos.quantidade
FROM produtos
LEFT JOIN pedidos
  ON produtos.id_produto = pedidos.id_produto;
--!--!LEFT JOIN

--!RIGHT JOIN
SELECT
produtos.nome,
pedidos.id_pedido
FROM produtos
RIGHT JOIN pedidos
ON produtos.id_produto=pedidos.id_produto;

GROUP BY--!
SELECT
  tema,
  COUNT(*) AS quantidade
FROM produtos
GROUP BY tema;

--! HAVING 
SELECT
tema,
COUNT(*) AS quantidade
FROM produtos
GROUP BY tema
HAVING COUNT(*)>=1;

--! Subconsulta
SELECT
nome,
preco
FROM produtos
WHERE preco>
(
SELECT AVG(preco)
FROM produtos
);