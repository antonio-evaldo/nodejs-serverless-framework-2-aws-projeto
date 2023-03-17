const AWS = require("aws-sdk");
const { processaCsv } = require("../processaCsv");
const { cadastrarAlunosNoBd } = require("../cadastrarAlunosNoBd");

module.exports.cadastrarAlunos = async (evento) => {
  try {
    const Bucket = evento.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));
    
    const s3 = new AWS.S3();
    const objetoBucket = await s3.getObject({ Bucket, Key }).promise();

    const dadosCsv = objetoBucket.Body.toString("utf-8");

    const resultados = await processaCsv(dadosCsv);

    if (resultados instanceof Error) throw resultados;

    await cadastrarAlunosNoBd(resultados);

    console.log({
      message: `${resultados.length} alunos foram cadastrados.`,
      alunos: resultados
    });
  } catch (erro) {
    console.log(erro);
  }
}
