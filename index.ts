import { initializeDatabase, closeDatabase } from './db/database';
import { question, print, printError, printSuccess, printInfo, printSeparator, close } from './utils/input';
import { formatarData } from './utils/dateFormatter';
import * as ufService from './services/ufService';
import * as cidadeService from './services/cidadeService';
import * as noticiaService from './services/noticiaService';

async function main() {
  // Inicializar banco de dados
  initializeDatabase();

  let running = true;

  while (running) {
    printSeparator();
    print('╔════════════════════════════════════════════════════════════╗');
    print('║          BEM-VINDO AO SISTEMA CONECTA SERV                ║');
    print('║                  MENU PRINCIPAL                            ║');
    print('╚════════════════════════════════════════════════════════════╝');
    print('\n0 - Cadastrar notícia');
    print('1 - Exibir todas as notícias (mais recentes primeiro)');
    print('2 - Exibir todas as notícias (mais antigas primeiro)');
    print('3 - Exibir notícias de um estado específico');
    print('4 - Exibir todas as notícias agrupadas por estado');
    print('5 - Cadastrar UF');
    print('6 - Cadastrar cidade');
    print('7 - Sair');

    const opcao = await question('\nEscolha uma opção: ');

    switch (opcao) {
      case '0':
        await cadastrarNoticia();
        break;
      case '1':
        await exibirNoticiasRecentes();
        break;
      case '2':
        await exibirNoticiasAntigas();
        break;
      case '3':
        await exibirNoticiasPorEstado();
        break;
      case '4':
        await exibirNoticiasAgrupadas();
        break;
      case '5':
        await cadastrarUF();
        break;
      case '6':
        await cadastrarCidade();
        break;
      case '7':
        running = false;
        printSuccess('Programa encerrado. Até logo!');
        break;
      default:
        printError('Opção inválida! Tente novamente.');
    }
  }

  closeDatabase();
  close();
}

async function cadastrarNoticia() {
  printSeparator();
  print('═══════════════════════════════════════════════════════════');
  print('                    CADASTRAR NOTÍCIA');
  print('═══════════════════════════════════════════════════════════');

  const titulo = await question('Título: ');
  const texto = await question('Texto: ');

  // Listar cidades disponíveis
  const cidadesResult = cidadeService.getAllCidades();
  if (!cidadesResult.success || cidadesResult.data!.length === 0) {
    printError('Nenhuma cidade cadastrada! Cadastre uma cidade primeiro.');
    return;
  }

  print('\nCidades disponíveis:');
  cidadesResult.data!.forEach((c, index) => {
    print(`${index} - ${c.nome}`);
  });

  const cidadeIndex = parseInt(await question('\nEscolha o índice da cidade: '));
  if (cidadeIndex < 0 || cidadeIndex >= cidadesResult.data!.length) {
    printError('Índice de cidade inválido!');
    return;
  }

  const cidade_id = cidadesResult.data![cidadeIndex].id;

  const result = await noticiaService.createNoticia(titulo, texto, cidade_id);
  if (result.success) {
    printSuccess(`Notícia cadastrada com sucesso! ID: ${result.id}`);
  } else {
    printError(result.error!);
  }
}

async function exibirNoticiasRecentes() {
  printSeparator();
  print('═══════════════════════════════════════════════════════════');
  print('              NOTICIAS - MAIS RECENTES PRIMEIRO');
  print('═══════════════════════════════════════════════════════════');

  const result = noticiaService.getNoticiasRecentes();
  if (!result.success || result.data!.length === 0) {
    printInfo('Nenhuma notícia cadastrada.');
    return;
  }

  result.data!.forEach((n, index) => {
    print(`\n[${index}] Título: ${n.titulo}`);
    print(`    Data: ${formatarData(n.data_criacao)}`);
    print(`    Texto: ${n.texto.substring(0, 100)}...`);
  });

  const opcao = await question('\n(z) Voltar: ');
  if (opcao.toLowerCase() !== 'z') {
    printError('Opção inválida!');
  }
}

async function exibirNoticiasAntigas() {
  printSeparator();
  print('═══════════════════════════════════════════════════════════');
  print('              NOTICIAS - MAIS ANTIGAS PRIMEIRO');
  print('═══════════════════════════════════════════════════════════');

  const result = noticiaService.getNoticiasAntigas();
  if (!result.success || result.data!.length === 0) {
    printInfo('Nenhuma notícia cadastrada.');
    return;
  }

  result.data!.forEach((n, index) => {
    print(`\n[${index}] Título: ${n.titulo}`);
    print(`    Data: ${formatarData(n.data_criacao)}`);
    print(`    Texto: ${n.texto.substring(0, 100)}...`);
  });

  const opcao = await question('\n(z) Voltar: ');
  if (opcao.toLowerCase() !== 'z') {
    printError('Opção inválida!');
  }
}

async function exibirNoticiasPorEstado() {
  printSeparator();
  print('═══════════════════════════════════════════════════════════');
  print('          NOTICIAS DE UM ESTADO ESPECÍFICO');
  print('═══════════════════════════════════════════════════════════');

  // Listar UFs disponíveis
  const ufsResult = ufService.getAllUFs();
  if (!ufsResult.success || ufsResult.data!.length === 0) {
    printError('Nenhum estado cadastrado!');
    return;
  }

  print('\nEstados disponíveis:');
  ufsResult.data!.forEach((u) => {
    print(`(${u.sigla}) - ${u.nome}`);
  });

  const sigla = (await question('\nDigite a sigla do estado: ')).toUpperCase();

  const result = noticiaService.getNoticiasPorEstado(sigla);
  if (!result.success || result.data!.length === 0) {
    printInfo(`Nenhuma notícia encontrada para o estado ${sigla}.`);
    return;
  }

  print(`\nNoticias do estado ${sigla}:`);
  print('(a) Ordenar por mais recentes');
  print('(b) Ordenar por mais antigas');
  const ordenacao = await question('\nEscolha a ordenação: ');

  let dados = result.data!;
  if (ordenacao.toLowerCase() === 'a') {
    dados.sort((x, y) => y.data_criacao - x.data_criacao);
  } else if (ordenacao.toLowerCase() === 'b') {
    dados.sort((x, y) => x.data_criacao - y.data_criacao);
  }

  dados.forEach((n, index) => {
    print(`\n[${index}] Título: ${n.titulo}`);
    print(`    Cidade: ${n.cidade_nome}`);
    print(`    Data: ${formatarData(n.data_criacao)}`);
    print(`    Texto: ${n.texto.substring(0, 100)}...`);
  });

  print('\n(d) Detalhar notícia');
  print('(z) Voltar');
  const opcaoFinal = await question('\nEscolha uma opção: ');

  if (opcaoFinal.toLowerCase() === 'd') {
    const noticiaIndex = parseInt(await question('Informe o número da notícia: '));
    if (noticiaIndex >= 0 && noticiaIndex < dados.length) {
      const n = dados[noticiaIndex];
      printSeparator();
      print(`Título: ${n.titulo}`);
      print(`Texto : ${n.texto}`);
    } else {
      printError('Número de notícia inválido!');
    }
  }
}

async function exibirNoticiasAgrupadas() {
  printSeparator();
  print('═══════════════════════════════════════════════════════════');
  print('          NOTICIAS AGRUPADAS POR ESTADO');
  print('═══════════════════════════════════════════════════════════');

  const result = noticiaService.getNoticiasAgrupadas();
  if (!result.success || Object.keys(result.data!).length === 0) {
    printInfo('Nenhuma notícia cadastrada.');
    return;
  }

  let contador = 0;
  const noticiaMap: { [key: number]: any } = {};

  for (const [sigla, noticias] of Object.entries(result.data!)) {
    print(`\n# ${sigla}`);
    (noticias as any[]).forEach((n) => {
      contador++;
      print(`${contador} - ${n.titulo} - ${n.cidade_nome}`);
      noticiaMap[contador] = n;
    });
  }

  print('\n(d) Detalhar notícia');
  print('(z) Voltar');
  const opcao = await question('\nEscolha uma opção: ');

  if (opcao.toLowerCase() === 'd') {
    const noticiaNum = parseInt(await question('Informe o número da notícia: '));
    if (noticiaMap[noticiaNum]) {
      const n = noticiaMap[noticiaNum];
      printSeparator();
      print(`Título: ${n.titulo}`);
      print(`Texto : ${n.texto}`);
    } else {
      printError('Número de notícia inválido!');
    }
  }
}

async function cadastrarUF() {
  printSeparator();
  print('═══════════════════════════════════════════════════════════');
  print('                    CADASTRAR UF');
  print('═══════════════════════════════════════════════════════════');

  const nome = await question('Nome da UF: ');
  const sigla = (await question('Sigla (ex: SP, RJ): ')).toUpperCase();

  const result = await ufService.createUF(nome, sigla);
  if (result.success) {
    printSuccess(`UF cadastrada com sucesso! ID: ${result.id}`);
  } else {
    printError(result.error!);
  }
}

async function cadastrarCidade() {
  printSeparator();
  print('═══════════════════════════════════════════════════════════');
  print('                    CADASTRAR CIDADE');
  print('═══════════════════════════════════════════════════════════');

  // Listar UFs disponíveis
  const ufsResult = ufService.getAllUFs();
  if (!ufsResult.success || ufsResult.data!.length === 0) {
    printError('Nenhum estado cadastrado! Cadastre um estado primeiro.');
    return;
  }

  print('\nEstados disponíveis:');
  ufsResult.data!.forEach((u, index) => {
    print(`${index} - ${u.nome} (${u.sigla})`);
  });

  const ufIndex = parseInt(await question('\nEscolha o índice do estado: '));
  if (ufIndex < 0 || ufIndex >= ufsResult.data!.length) {
    printError('Índice de estado inválido!');
    return;
  }

  const uf_id = ufsResult.data![ufIndex].id;
  const nome = await question('Nome da cidade: ');

  const result = await cidadeService.createCidade(nome, uf_id);
  if (result.success) {
    printSuccess(`Cidade cadastrada com sucesso! ID: ${result.id}`);
  } else {
    printError(result.error!);
  }
}

// Executar a aplicação
main().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
