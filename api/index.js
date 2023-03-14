const { parse } = require("fast-csv");
const { construirResposta } = require("./utils");
const aws = require("aws-sdk");

module.exports.cadastrarAlunos = async (evento) => {
  try {
    const s3 = new aws.S3();

    const Bucket = evento.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));
    const objetoBucket = await s3.getObject({ Bucket, Key }).promise();

    const dadosCsv = objetoBucket.Body.toString("utf-8");

    const resultado = await new Promise((resolver, rejeitar) => {
      const alunos = [];

      const stream = parse({ headers: ["nome", "matricula"], renameHeaders: true })
      .on("error", (erro) => rejeitar(erro))
      .on("data", (aluno) => {
        alunos.push(aluno);
        console.log(aluno);
        // Chamar API para cadastrar aluno...
      })
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
    console.log(erro);
    return construirResposta(500, {
      message: erro.message,
      erro
    });
  }
};
