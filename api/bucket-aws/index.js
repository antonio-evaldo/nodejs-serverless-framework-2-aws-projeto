const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { converteDadosCsv } = require("../converteDadosCsv");
const { cadastrarAlunosNoBd } = require("../cadastrarAlunosNoBd");

module.exports.cadastrarAlunos = async (evento) => {
  try {
    const Bucket = evento.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));

    const cliente = new S3Client({});
    const comandoObterObjeto = new GetObjectCommand({ Bucket, Key });
    const objetoBucket = await cliente.send(comandoObterObjeto);

    const dadosCsv = await objetoBucket.Body.transformToString();
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
