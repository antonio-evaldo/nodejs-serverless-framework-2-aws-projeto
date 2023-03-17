const { parse } = require("fast-csv");

function processaCsv(dadosCsv) {
  return new Promise((resolver, rejeitar) => {
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
}

module.exports = { processaCsv };