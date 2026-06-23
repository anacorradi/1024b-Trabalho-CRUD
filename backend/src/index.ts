import express from 'express';
import cors from 'cors';
import connection from './mysql_connection.js';
import MysqlErrorHandle from './mysql_error_handle.js';
import { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';

const app = express();

app.use(cors());
app.use(express.json());

interface ICliente extends RowDataPacket {
  id_cliente: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cidade: string;
}

interface IProduto extends RowDataPacket {
  id_produto: number;
  nome: string;
  tema: string;
  foto_url?: string;
  faixa_etaria: string;
  pecas: number;
  preco: number;
  estoque: number;
  ano_lancamento: number;
}

interface IPedido extends RowDataPacket {
  id_pedido: number;
  id_cliente: number;
  id_produto: number;
  quantidade: number;
  data_pedido: Date;
  valor_total: number;
}

interface IPedidoJoin extends RowDataPacket {
  id_pedido: number;
  cliente: string;
  produto: string;
  quantidade: number;
  data_pedido: Date;
  valor_total: number;
}

//====================CLIENTES====================

//GET

app.get('/clientes', async (req, res) => {

  try {
    const [dados] = await connection.execute<ICliente[]>(
      `SELECT *
  FROM clientes
  ORDER BY nome`
    );
    return res.status(200).json(dados);

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});
//GET CLIENTE POR ID

app.get('/clientes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [dados] = await connection.execute<ICliente[]>(
      'SELECT * FROM clientes WHERE id_cliente=?',
      [id]
    );

    if (dados.length === 0) {
      return res.status(404).json({
        mensagem: 'Cliente não encontrado!'
      });
    }
    return res.status(200).json(dados);

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//POST

app.post('/clientes', async (req, res) => {

  const {
    nome,
    cpf,
    telefone,
    email,
    cidade
  } = req.body;

  if (
    nome === undefined ||
    cpf === undefined ||
    telefone === undefined ||
    email === undefined ||
    cidade === undefined
  ) {

    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios!'
    });
  }

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO clientes
(nome,cpf,telefone,email,cidade)
VALUES(?,?,?,?,?)`,

      [
        nome,
        cpf,
        telefone,
        email,
        cidade
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao cadastrar cliente!'
      });
    }

    return res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//PATCH

app.patch('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const {
    nome,
    cpf,
    telefone,
    email,
    cidade
  } = req.body;

  try {
    const [rows] = await connection.execute<ICliente[]>(
      'SELECT * FROM clientes WHERE id_cliente=?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Cliente não encontrado!'
      });
    }

    const clienteAtual = rows[0]!;
    const novoNome = nome ?? clienteAtual.nome;
    const novoCpf = cpf ?? clienteAtual.cpf;
    const novoTelefone = telefone ?? clienteAtual.telefone;
    const novoEmail = email ?? clienteAtual.email;
    const novaCidade = cidade ?? clienteAtual.cidade;

    const [result] = await connection.execute<ResultSetHeader>(

      `UPDATE clientes
SET
nome=?,
cpf=?,
telefone=?,
email=?,
cidade=?
WHERE id_cliente=?`,

      [
        novoNome,
        novoCpf,
        novoTelefone,
        novoEmail,
        novaCidade,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao atualizar cliente!'
      });
    }

    return res.status(200).json({
      mensagem: 'Cliente atualizado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//DELETE

app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM clientes WHERE id_cliente=?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Cliente não encontrado!'
      });
    }

    return res.status(204).send({
      mensagem: 'Cliente deletado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//====================PRODUTOS====================

//GET

app.get('/produtos', async (req, res) => {
  const { tema } = req.query;

  try {

    let sql = `SELECT * FROM produtos`;
    const valores: any[] = [];

    if (tema) {
      sql += ` WHERE tema=?`;
      valores.push(tema);
    }

    sql += ` ORDER BY nome`;
    const [dados] = await connection.execute<IProduto[]>(sql, valores);
    return res.status(200).json(dados);
  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//POST

app.post('/produtos', async (req, res) => {
  const {
    nome,
    tema,
    foto_url,
    faixa_etaria,
    pecas,
    preco,
    estoque,
    ano_lancamento
  } = req.body;

  if (
    nome === undefined ||
    tema === undefined ||
    faixa_etaria === undefined ||
    pecas === undefined ||
    preco === undefined ||
    estoque === undefined ||
    ano_lancamento === undefined
  ) {

    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios!'
    });
  }

  try {

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO produtos
(nome,tema,foto_url,faixa_etaria,pecas,preco,estoque,ano_lancamento)
VALUES(?,?,?,?,?,?,?,?)`,

      [
        nome,
        tema,
        foto_url,
        faixa_etaria,
        pecas,
        preco,
        estoque,
        ano_lancamento
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao cadastrar produto!'
      });
    }

    return res.status(201).json({
      mensagem: 'Produto cadastrado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});
//PATCH PRODUTOS

app.patch('/produtos/:id', async (req, res) => {
  const { id } = req.params;

  const {
    nome,
    tema,
    foto_url,
    faixa_etaria,
    pecas,
    preco,
    estoque,
    ano_lancamento
  } = req.body;

  try {
    const [rows] = await connection.execute<IProduto[]>(
      'SELECT * FROM produtos WHERE id_produto=?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado!'
      });
    }

    const produtoAtual = rows[0]!;

    const novoNome = nome ?? produtoAtual.nome;
    const novoTema = tema ?? produtoAtual.tema;
    const novoFotoUrl = foto_url ?? produtoAtual.foto_url;
    const novaFaixa = faixa_etaria ?? produtoAtual.faixa_etaria;
    const novasPecas = pecas ?? produtoAtual.pecas;
    const novoPreco = preco ?? produtoAtual.preco;
    const novoEstoque = estoque ?? produtoAtual.estoque;
    const novoAno = ano_lancamento ?? produtoAtual.ano_lancamento;

    const [result] = await connection.execute<ResultSetHeader>(

      `UPDATE produtos
SET
nome=?,
tema=?,
foto_url=?,
faixa_etaria=?,
pecas=?,
preco=?,
estoque=?,
ano_lancamento=?
WHERE id_produto=?`,

      [
        novoNome,
        novoTema,
        novoFotoUrl,
        novaFaixa,
        novasPecas,
        novoPreco,
        novoEstoque,
        novoAno,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao atualizar produto!'
      });
    }

    return res.status(200).json({
      mensagem: 'Produto atualizado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//DELETE PRODUTOS

app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM produtos WHERE id_produto=?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado!'
      });
    }
    return res.status(204).send({
      mensagem: 'Produto deletado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//====================PEDIDOS====================

//GET

app.get('/pedidos', async (req, res) => {
  try {
    const [dados] = await connection.execute<IPedidoJoin[]>(
      `SELECT
pedidos.id_pedido,
clientes.nome AS cliente,
produtos.nome AS produto,
pedidos.quantidade,
pedidos.data_pedido,
pedidos.valor_total
FROM pedidos
INNER JOIN clientes
ON pedidos.id_cliente=clientes.id_cliente
INNER JOIN produtos
ON pedidos.id_produto=produtos.id_produto`

    );
    return res.status(200).json(dados);

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});
//GET PEDIDO POR ID

app.get('/pedidos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [dados] = await connection.execute<IPedidoJoin[]>(
      `SELECT
pedidos.id_pedido,
clientes.nome AS cliente,
produtos.nome AS produto,
pedidos.quantidade,
pedidos.data_pedido,
pedidos.valor_total
FROM pedidos
INNER JOIN clientes
ON pedidos.id_cliente=clientes.id_cliente
INNER JOIN produtos
ON pedidos.id_produto=produtos.id_produto

WHERE pedidos.id_pedido=?`,
      [id]
    );

    if (dados.length === 0) {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado!'
      });
    }
    return res.status(200).json(dados);

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }

});

//POST

app.post('/pedidos', async (req, res) => {

  const {
    id_cliente,
    id_produto,
    quantidade,
    valor_total
  } = req.body;

  if (
    id_cliente === undefined ||
    id_produto === undefined ||
    quantidade === undefined ||
    valor_total === undefined
  ) {
    return res.status(400).json({
      mensagem: 'Todos os campos são obrigatórios!'
    });
  }

  const dataPedido = new Date().toISOString().split('T')[0]!;
  try {
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO pedidos
(id_cliente,id_produto,quantidade,data_pedido,valor_total)
VALUES(?,?,?,?,?)`,

      [
        id_cliente,
        id_produto,
        quantidade,
        dataPedido,
        valor_total
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao cadastrar pedido!'
      });
    }

    return res.status(201).json({
      mensagem: 'Pedido cadastrado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }

});
//PATCH PEDIDOS

app.patch('/pedidos/:id', async (req, res) => {
  const { id } = req.params;

  const {
    id_cliente,
    id_produto,
    quantidade,
    valor_total
  } = req.body;

  try {
    const [rows] = await connection.execute<IPedido[]>(
      'SELECT * FROM pedidos WHERE id_pedido=?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado!'
      });
    }

    const pedidoAtual = rows[0]!;
    const novoCliente = id_cliente ?? pedidoAtual.id_cliente;
    const novoProduto = id_produto ?? pedidoAtual.id_produto;
    const novaQuantidade = quantidade ?? pedidoAtual.quantidade;
    const novoValor = valor_total ?? pedidoAtual.valor_total;
    const [result] = await connection.execute<ResultSetHeader>(

      `UPDATE pedidos
SET
id_cliente=?,
id_produto=?,
quantidade=?,
valor_total=?
WHERE id_pedido=?`,

      [
        novoCliente,
        novoProduto,
        novaQuantidade,
        novoValor,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({
        mensagem: 'Erro ao atualizar pedido!'
      });
    }

    return res.status(200).json({
      mensagem: 'Pedido atualizado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//DELETE PEDIDOS

app.delete('/pedidos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM pedidos WHERE id_pedido=?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado!'
      });
    }

    return res.status(204).send({
      mensagem: 'Pedido deletado com sucesso!'
    });

  } catch (err) {
    const mysqlErrorHandle = new MysqlErrorHandle(err, res);
    return mysqlErrorHandle.validar();
  }
});

//ROTA INICIAL

app.get('/', (req, res) => {
  return res.status(200).json({
    mensagem: 'API Loja LEGO funcionando!'
  });
});

//SERVIDOR

app.listen(8000, () => {
  console.log('Servidor iniciado na porta 8000');
});
