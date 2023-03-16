const { parse } = require("fast-csv");

function processaCsv(dadosCsv) {
  return new Promise((resolver, rejeitar) => {
    const alunosPromessas = [];

    const stream = parse({ headers: ["nome", "matricula"], renameHeaders: true })
      .on("error", (erro) => rejeitar(erro))
      .on("data", (aluno) => {
        const promessa = fetch("http://ecs-django-186565849.us-east-1.elb.amazonaws.com/alunos", {
          method: "POST",
          body: JSON.stringify(aluno),
          headers: { 'Content-Type': 'application/json' }
        })

        alunosPromessas.push(promessa);
      })
      .on("end", () => {
        resolver(alunosPromessas);
      });

    stream.write(dadosCsv);
    stream.end();
  });
}

module.exports = { processaCsv };