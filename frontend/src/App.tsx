import { useEffect, useState } from 'react';
import './App.css';
import Catalogo from './Catalogo';
import Pedidos from './Pedidos';

interface Produto {
  id_produto: number;
  nome: string;
  tema: string;
  faixa_etaria: string;
  pecas: number;
  preco: number;
  estoque: number;
  ano_lancamento: number;
  foto_url?: string;
}

function App() {

  const [pagina, setPagina] =
  useState<
  'admin' |
  'catalogo' |
  'pedidos'
  >('admin');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [filtroTema, setFiltroTema] = useState('');

  const [nome, setNome] = useState('');
  const [tema, setTema] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState('');
  const [pecas, setPecas] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');
  const [anoLancamento, setAnoLancamento] = useState('');

  const [salvando, setSalvando] = useState(false);
  const [fotoUrl, setFotoUrl] = useState('');

  async function carregarProdutos(temaFiltro?: string) {
    try {
      setCarregando(true);

      let url = 'http://localhost:8000/produtos';

      if (temaFiltro && temaFiltro.trim() !== '') {
        url += `?tema=${encodeURIComponent(temaFiltro)}`;
      }

      const resposta = await fetch(url);

      if (!resposta.ok) {
        throw new Error('Erro ao buscar produtos.');
      }

      const dados = await resposta.json();

      setProdutos(dados);

      setErro(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErro(e.message);
      } else {
        setErro('Erro inesperado.');
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function handleFiltrar() {
    await carregarProdutos(filtroTema);
  }

  async function handleSalvar() {
    try {
      setSalvando(true);

      const resposta = await fetch(
        'http://localhost:8000/produtos',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: nome,
            tema: tema,
            foto_url: fotoUrl || null,
            faixa_etaria: faixaEtaria,
            pecas: Number(pecas),
            preco: Number(preco),
            estoque: Number(estoque),
            ano_lancamento: Number(anoLancamento),
          }),
        }
      );

      if (!resposta.ok) {
        const erroResposta = await resposta.json();
        throw new Error(
          erroResposta.mensagem ||
            'Erro ao cadastrar produto.'
        );
      }

      setNome('');
      setTema('');
      setFotoUrl('');
      setFaixaEtaria('');
      setPecas('');
      setPreco('');
      setEstoque('');
      setAnoLancamento('');

      await carregarProdutos(filtroTema);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro inesperado.');
      }
    } finally {
      setSalvando(false);
    }
  }
  async function handleDeletar(id: number) {
    try {
      const resposta = await fetch(
        `http://localhost:8000/produtos/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!resposta.ok) {
        const erroResposta = await resposta.json();

        throw new Error(
          erroResposta.mensagem ||
            'Erro ao deletar produto.'
        );
      }

      await carregarProdutos(filtroTema);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro desconhecido.');
      }
    }
  }

  async function handleEditar(produto: Produto) {
    if (typeof window.prompt !== 'function') {
      alert('Edição via prompt() não suportada neste ambiente. Abra o app no navegador ou use o formulário de cadastro para atualizar.');
      return;
    }

    const novoNome = prompt('Nome:', produto.nome) ?? produto.nome;
    const novoTema = prompt('Tema:', produto.tema) ?? produto.tema;
    const novaFaixa = prompt('Faixa etária:', produto.faixa_etaria) ?? produto.faixa_etaria;
    const novasPecas = prompt('Peças:', produto.pecas.toString()) ?? produto.pecas.toString();
    const novoPreco = prompt('Preço:', produto.preco.toString()) ?? produto.preco.toString();
    const novoEstoque = prompt('Estoque:', produto.estoque.toString()) ?? produto.estoque.toString();
    const novoAno = prompt('Ano:', produto.ano_lancamento.toString()) ?? produto.ano_lancamento.toString();

    try {
      const resposta = await fetch(
        `http://localhost:8000/produtos/${produto.id_produto}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: novoNome,
            tema: novoTema,
            faixa_etaria: novaFaixa,
            pecas: Number(novasPecas),
            preco: Number(novoPreco),
            estoque: Number(novoEstoque),
            ano_lancamento: Number(novoAno),
          }),
        }
      );

      if (!resposta.ok) {
        const erroResposta = await resposta.json();

        throw new Error(
          erroResposta.mensagem ||
            'Erro ao atualizar produto.'
        );
      }

      await carregarProdutos(filtroTema);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('Erro inesperado.');
      }
    }
  }

  if (pagina === 'catalogo') {
    return (
      <>
        <button
          className="botaoVoltarAdmin"
          onClick={() => setPagina('admin')}
        >
          Painel Administrativo
        </button>
        <Catalogo />
      </>
    );
  }

  if (pagina === 'pedidos') {
    return (
      <Pedidos voltar={() => setPagina('admin')} />
    );
  }

  return (
    <div className="container">
      <div className="menu-superior">
        <button
          className="menu-btn"
          onClick={() =>
            setPagina('catalogo')
          }
        >
          Catálogo
        </button>

        <button
          className="menu-btn"
          onClick={() =>
            setPagina('pedidos')
          }
        >
          Pedidos
        </button>
      </div>

      <h1 className="titulo">LOJA LEGO</h1>

      <h2 className="subtitulo">Cadastrar Produto</h2>

      <div className="painelFormulario">
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
        />

        <input
          placeholder="Tema"
          value={tema}
          onChange={(e) =>
            setTema(e.target.value)
          }
        />

        <input
          placeholder="Link da foto"
          value={fotoUrl}
          onChange={(e) =>
            setFotoUrl(e.target.value)
          }
        />

        <input
          placeholder="Faixa Etária"
          value={faixaEtaria}
          onChange={(e) =>
            setFaixaEtaria(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Peças"
          value={pecas}
          onChange={(e) =>
            setPecas(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) =>
            setPreco(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Estoque"
          value={estoque}
          onChange={(e) =>
            setEstoque(e.target.value)
          }
        />

        <input
          type="number"
          placeholder="Ano"
          value={anoLancamento}
          onChange={(e) =>
            setAnoLancamento(e.target.value)
          }
        />

        <button
          className="botaoSalvar"
          onClick={handleSalvar}
          disabled={salvando}
        >
          {salvando
            ? 'Salvando...'
            : 'Salvar'}
        </button>
      </div>

      <hr className="separador" />

      <h2 className="subtitulo">Filtrar por Tema</h2>

      <input
        className="campoFiltro"
        value={filtroTema}
        onChange={(e) =>
          setFiltroTema(e.target.value)
        }
      />

      <button className="botaoFiltrar" onClick={handleFiltrar}>
        Filtrar
      </button>

      <button
        className="botaoTodos"
        onClick={() => {
          setFiltroTema('');
          carregarProdutos();
        }}
      >
        Mostrar Todos
      </button>

      <hr className="separador" />

      {carregando && <p>Carregando...</p>}

      {erro && (
        <p style={{ color: 'red' }}>
          {erro}
        </p>
      )}
      {!carregando &&
        !erro &&
        produtos.length === 0 && (
          <p>Nenhum produto encontrado.</p>
        )}

      <hr className="separador" />

      <h2 className="subtitulo">Produtos</h2>

      <ul className="listaProdutos">
        {produtos.map((produto) => (
          <li className="cardProduto" key={produto.id_produto}>
            {produto.foto_url && (
              <div className="infoProduto fotoProduto">
                <img
                  src={produto.foto_url}
                  alt={produto.nome}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/180x120?text=Sem+imagem';
                  }}
                />
              </div>
            )}

            <p className="infoProduto">
              <strong>ID:</strong>{' '}
              {produto.id_produto}
            </p>

            <p className="infoProduto">
              <strong>Nome:</strong>{' '}
              {produto.nome}
            </p>

            <p className="infoProduto">
              <strong>Tema:</strong>{' '}
              {produto.tema}
            </p>

            <p className="infoProduto">
              <strong>Faixa Etária:</strong>{' '}
              {produto.faixa_etaria}
            </p>

            <p className="infoProduto">
              <strong>Peças:</strong>{' '}
              {produto.pecas}
            </p>

            <p className="infoProduto">
              <strong>Preço:</strong> R$
              {produto.preco}
            </p>

            <p className="infoProduto">
              <strong>Estoque:</strong>{' '}
              {produto.estoque}
            </p>

            <p className="infoProduto">
              <strong>Ano:</strong>{' '}
              {produto.ano_lancamento}
            </p>

            <button
              className="botaoEditar"
              onClick={() =>
                handleEditar(produto)
              }
            >
              Editar
            </button>

            {' '}

            <button
              className="botaoExcluir"
              onClick={() =>
                handleDeletar(
                  produto.id_produto
                )
              }
            >
              Excluir
            </button>

            <hr className="separador" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
