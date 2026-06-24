import { useEffect, useState, useMemo } from 'react';
import './Catalogo.css';

interface Produto {
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

function Catalogo() {

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [temaSelecionado, setTemaSelecionado] = useState('');
  const [busca, setBusca] = useState('');
  const [precoMin, setPrecoMin] = useState('');
  const [precoMax, setPrecoMax] = useState('');
  const [ordem, setOrdem] = useState<'nome' | 'preco-asc' | 'preco-desc'>('nome');

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch('http://localhost:8000/produtos');

        if (!resposta.ok) {
          const dadosErro = await resposta.json().catch(() => null);
          const mensagem =
            dadosErro && typeof dadosErro === 'object' && 'mensagem' in dadosErro
              ? (dadosErro as any).mensagem
              : 'Erro ao carregar produtos.';
          setErro(mensagem);
          setProdutos([]);
          return;
        }

        const dados = await resposta.json();
        setProdutos(dados);
        setErro(null);

      } catch (erro) {

        console.error(erro);
        setErro('Erro ao carregar produtos. Verifique o servidor.');
        setProdutos([]);

      } finally {

        setCarregando(false);

      }

    }

    carregarProdutos();

  }, []);

  function aplicarFiltroTema(tema: string) {
    setTemaSelecionado(tema);
  }

  const produtosFiltrados = useMemo(() => {
    let lista = [...produtos];

    if (busca.trim() !== '') {
      lista = lista.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase())
      );
    }

    if (temaSelecionado !== '') {
      lista = lista.filter(p => p.tema === temaSelecionado);
    }

    if (precoMin !== '') {
      lista = lista.filter(
        p => p.preco >= Number(precoMin)
      );
    }

    if (precoMax !== '') {
      lista = lista.filter(
        p => p.preco <= Number(precoMax)
      );
    }

    if (ordem === 'nome') {
      lista.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (ordem === 'preco-asc') {
      lista.sort((a, b) => a.preco - b.preco);
    } else if (ordem === 'preco-desc') {
      lista.sort((a, b) => b.preco - a.preco);
    }

    return lista;
  }, [produtos, busca, temaSelecionado, precoMin, precoMax, ordem]);

  const temas = useMemo(() => {
    const map = new Map<string, number>();

    produtos.forEach((p) => {
      map.set(p.tema, (map.get(p.tema) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([tema, quantidade]) => ({
        tema,
        quantidade,
      }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [produtos]);

    return (

    <div className="catalogo">

      <div className="catalogo-header">

        <div className="logo-lego">
          <img
            src="https://logos-world.net/wp-content/uploads/2020/09/LEGO-Logo-1972-1998.png"
            alt="LEGO Store"
          />
        </div>

        <div className="menu-catalogo">

          <button>
            Produtos
          </button>

          <button>
            Descobrir
          </button>

          <button>
            Ajuda
          </button>

        </div>

      </div>

      <div className="catalogo-body">

        <aside className="sidebar">

          <h2>
            Categorias
          </h2>

          <button
            className={
              temaSelecionado === ''
                ? 'ativo'
                : ''
            }
            onClick={() =>
              aplicarFiltroTema('')
            }
          >
            Todos
          </button>

          {temas.map(({ tema, quantidade }) => (

            <button
              key={tema}
              className={
                temaSelecionado === tema
                  ? 'ativo'
                  : ''
              }
              onClick={() =>
                aplicarFiltroTema(tema)
              }
            >
              <span>{tema}</span>
              <span className="theme-count">
                {quantidade}
              </span>
            </button>

          ))}

        </aside>

        <main className="produtos-area">

          <div className="topo-produtos">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input-busca"
              />
            </div>

            <div className="filtros-controle">
              <div className="grupo-filtro">
                <label>Ordenar por:</label>
                <select
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as any)}
                  className="select-ordem"
                >
                  <option value="nome">Nome</option>
                  <option value="preco-asc">Menor preço</option>
                  <option value="preco-desc">Maior preço</option>
                </select>
              </div>

              <div className="grupo-filtro">
                <label>Preço mínimo:</label>
                <input
                  type="number"
                  placeholder="Ex: 100"
                  value={precoMin}
                  onChange={(e) =>
                    setPrecoMin(e.target.value)
                  }
                  className="input-preco"
                />
              </div>

              <div className="grupo-filtro">
                <label>Preço máximo:</label>
                <input
                  type="number"
                  placeholder="Ex: 1000"
                  value={precoMax}
                  onChange={(e) =>
                    setPrecoMax(e.target.value)
                  }
                  className="input-preco"
                />
              </div>
            </div>

            {temaSelecionado && (
              <div className="chip-ativo">
                <span>Tema: {temaSelecionado}</span>
                <button
                  className="btn-limpar-chip"
                  onClick={() => setTemaSelecionado('')}
                >
                  ×
                </button>
              </div>
            )}

            <h2>
              Exibindo {produtosFiltrados.length} produtos
            </h2>

          </div>

          {carregando && (
            <p className="mensagem-estado">
              Carregando...
            </p>
          )}

          {erro && (
            <p className="mensagem-erro">
              {erro}
            </p>
          )}

          {!carregando && !erro && produtosFiltrados.length === 0 && (
            <p className="mensagem-vazio">
              Nenhum produto encontrado com os filtros selecionados.
            </p>
          )}

          <div className="produtos-grid">

            {produtosFiltrados.map(
              (produto) => (

                <div
                  key={
                    produto.id_produto
                  }
                  className="produto-card"
                >

                  <div className="badge">
                    Novo
                  </div>

                  <div className="produto-imagem">
                    {produto.foto_url ? (
                      <img
                        src={produto.foto_url}
                        alt={produto.nome}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/180x120?text=Imagem+inválida';
                        }}
                      />
                    ) : (
                      '🧱'
                    )}
                  </div>

                  <h3>
                    {produto.nome}
                  </h3>

                  <p>
                    Tema:
                    {' '}
                    {produto.tema}
                  </p>

                  <p>
                    Idade:
                    {' '}
                    {
                      produto.faixa_etaria
                    }
                  </p>

                  <p>
                    Peças:
                    {' '}
                    {produto.pecas}
                  </p>

                  <div className="preco">

                    R$
                    {' '}
                    {produto.preco}

                  </div>

                  <button
                    className="btn-carrinho"
                  >
                    Adicionar ao Carrinho
                  </button>

                </div>

              )
            )}

          </div>

        </main>

      </div>

    </div>

  );

}

export default Catalogo;