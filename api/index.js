const { parse } = require("fast-csv");
const { construirResposta } = require("./utils");

module.exports.cadastrarAlunos = async (evento) => {
  try {
    const dadosCsv = evento.body;

    console.log(dadosCsv);

    const resultado = await new Promise((resolver, rejeitar) => {
      const alunos = [];

      const stream = parse({ headers: ["nome", "matricula"], renameHeaders: true })
      .on("data", (aluno) => {
        console.log(aluno);
        alunos.push(aluno);
        // Chamar API para cadastrar aluno...
      })
      .on("error", (erro) => rejeitar(erro))
      .on("end", (linhasConvertidas) => {
        resolver({
          message: `Conversão realizada com sucesso: ${linhasConvertidas} linhas foram convertidas.`,
          alunos
        })
      });

      stream.write(dadosCsv);
      stream.end();
    });

    if (resultado instanceof Error) {
      return construirResposta(422, resultado);
    }

    return construirResposta(201, resultado);
  } catch (erro) {
    return construirResposta(500, {
      message: erro.message,
      erro
    });
  }
};
