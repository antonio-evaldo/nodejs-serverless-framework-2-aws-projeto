const AWS = require("aws-sdk");
const { converteDadosCsv } = require("../converteDadosCsv");
const { cadastrarAlunosNoBd } = require("../cadastrarAlunosNoBd");

module.exports.cadastrarAlunos = async (evento) => {
  try {
    const Bucket = evento.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));
    
    const s3 = new AWS.S3();
    const objetoBucket = await s3.getObject({ Bucket, Key }).promise();

    const dadosCsv = objetoBucket.Body.toString("utf-8");

    const alunos = await converteDadosCsv(dadosCsv);

    await cadastrarAlunosNoBd(alunos);

    console.log({
      message: `${alunos.length} alunos foram cadastrados.`,
      alunos
    });
  } catch (erro) {
    console.log(erro);
  }
}
