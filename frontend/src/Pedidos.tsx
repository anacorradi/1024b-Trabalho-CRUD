import { useEffect, useState } from 'react';
import './Pedidos.css';

interface Pedido {
  id_pedido: number;
  cliente: string;
  produto: string;
  quantidade: number;
  data_pedido: string;
  valor_total: number;
}

interface PedidosProps {
  voltar: () => void;
}

function Pedidos({ voltar }: PedidosProps) {

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {

    async function carregarPedidos() {

      try {

        const resposta =
        await fetch(
          'http://localhost:8000/pedidos'
        );

        if (!resposta.ok) {
          const dadosErro = await resposta.json().catch(() => null);
          const mensagem =
            dadosErro && typeof dadosErro === 'object' && 'mensagem' in dadosErro
              ? (dadosErro as any).mensagem
              : 'Erro ao carregar pedidos.';
          setErro(mensagem);
          setPedidos([]);
          return;
        }

        const dados =
        await resposta.json();

        if (!Array.isArray(dados)) {
          setErro('Resposta inválida do servidor.');
          setPedidos([]);
          return;
        }

        setPedidos(dados);
        setErro(null);

      } catch (erro) {

        console.error(erro);
        setErro('Erro ao carregar pedidos. Verifique o servidor.');
        setPedidos([]);

      } finally {

        setCarregando(false);

      }

    }

    carregarPedidos();

  }, []);

  return (

    <div className="pedidos-container">

      <button
        className="menu-btn botao-voltar"
        onClick={voltar}
      >
        ← Voltar
      </button>

      <h1>Pedidos dos Clientes</h1>

      {carregando && (
        <p>Carregando...</p>
      )}

      {erro && (
        <p className="erro">{erro}</p>
      )}

      {!carregando && !erro && pedidos.length === 0 && (
          <p>Nenhum pedido encontrado.</p>
      )}

      <div className="pedidos-grid">

        {pedidos.map((pedido) => (

          <div
            key={pedido.id_pedido}
            className="pedido-card"
          >

            <h2>
              Pedido #{pedido.id_pedido}
            </h2>

            <p>
              <strong>Cliente:</strong>
              {' '}
              {pedido.cliente}
            </p>

            <p>
              <strong>Produto:</strong>
              {' '}
              {pedido.produto}
            </p>

            <p>
              <strong>Quantidade:</strong>
              {' '}
              {pedido.quantidade}
            </p>

            <p>
              <strong>Data:</strong>
              {' '}
              {pedido.data_pedido}
            </p>

            <div className="valor-total">
              R$ {pedido.valor_total}
            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default Pedidos;