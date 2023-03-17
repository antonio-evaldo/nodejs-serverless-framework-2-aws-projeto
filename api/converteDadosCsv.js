const { parse } = require("fast-csv");

async function converteDadosCsv(dadosCsv) {
  const resultados = await new Promise((resolver, rejeitar) => {
    const alunos = [];

    const stream = parse({ headers: ["nome", "matricula"], renameHeaders: true })
      .on("data", (aluno) => {
        alunos.push(aluno);
      })
      .on("error", () => rejeitar(new Error("Erro na conversão do CSV.")))
      .on("end", () => {
        resolver(alunos);
      });

    stream.write(dadosCsv);
    stream.end();
  });

  if (resultados instanceof Error) throw resultados;

  return resultados;
}

module.exports = { converteDadosCsv };