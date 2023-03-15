const { parse } = require("fast-csv");
const aws = require("aws-sdk");

module.exports.index = async (evento) => {
  try {
    const s3 = new aws.S3();

    const Bucket = evento.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));
    const objetoBucket = await s3.getObject({ Bucket, Key }).promise();

    const dadosCsv = objetoBucket.Body.toString("utf-8");

    const resultado = await new Promise((resolver, rejeitar) => {
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

    if (Array.isArray(resultado)) {
      const alunos = await Promise.all(resultado);

      console.log({
        message: `${resultado.length} alunos foram cadastrados.`,
        alunos
      });

      return;
    } else {
      console.log(resultado);
    }
  } catch (erro) {
    console.log(erro);
  }
};
