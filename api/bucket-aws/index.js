const AWS = require("aws-sdk");
const { processaCsv } = require("../processaCsv");

module.exports.cadastrarAlunos = async (evento) => {
  try {
    const Bucket = evento.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));
    
    const s3 = new AWS.S3();
    const objetoBucket = await s3.getObject({ Bucket, Key }).promise();

    const dadosCsv = objetoBucket.Body.toString("utf-8");

    const resultado = await processaCsv(dadosCsv);

    if (Array.isArray(resultado)) {
      const alunos = await Promise.all(resultado);

      console.log({
        message: `${resultado.length} alunos foram cadastrados.`,
        alunos
      });
    } else {
      console.log(resultado);
    }
  } catch (erro) {
    console.log(erro);
  }
}
