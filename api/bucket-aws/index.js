const AWS = require("aws-sdk");
const { readFile } = require("fs/promises");
const { processaCsv } = require("../processaCsv");

module.exports.cadastrarAlunos = async (evento) => {
  try {
    const nomeBucket = evento.Records[0].s3.bucket.name;
    const chaveBucket = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));

    const dadosCsv = await readFile(`./buckets/${nomeBucket}/${chaveBucket}._S3rver_object`, "utf-8");

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
