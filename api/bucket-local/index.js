const AWS = require("aws-sdk");
const { readFile } = require("fs/promises");
const path = require('path');
const { processaCsv } = require("../processaCsv");

module.exports.simulandoUploadDeBucket = async () => {
  try {
    const S3 = new AWS.S3({
      s3ForcePathStyle: true,
      accessKeyId: "S3RVER", // This specific key is required when working offline
      secretAccessKey: "S3RVER",
      endpoint: new AWS.Endpoint("http://localhost:4569"),
    });

    const caminhoArquivoCsv = path.join(__dirname, "cadastro_usuarios_1_aluno.csv");

    const dadosCsv = await readFile(caminhoArquivoCsv, "utf-8");

    const resultado = await new Promise((resolver, rejeitar) => {
      S3.putObject({
        Bucket: "bucket-local",
        Key: "1234",
        Body: Buffer.from(dadosCsv)
      }, (erro, dados) => {
        if (erro) rejeitar(erro)
        else resolver(dados);
      })
    });

    let statusCode = resultado instanceof Error ? 500 : 201;
    
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultado)
    }
  } catch (erro) {
    console.log(erro);
    return {
      statusCode: erro.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(erro)
    }
  }
};

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
