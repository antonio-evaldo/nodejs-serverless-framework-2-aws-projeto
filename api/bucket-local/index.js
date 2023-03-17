const AWS = require("aws-sdk");
const { readFile } = require("fs/promises");
const path = require('path');
const { converteDadosCsv } = require("../converteDadosCsv");
const { cadastrarAlunosNoBd } = require("../cadastrarAlunosNoBd");

function criaBucketLocalComCsv(dadosCsv) {
  return new Promise((resolver, rejeitar) => {
    const S3 = new AWS.S3({
      s3ForcePathStyle: true,
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
      endpoint: new AWS.Endpoint("http://localhost:4569"),
    });

    S3.putObject({
      Bucket: "alunos-csv-local",
      Key: "1234",
      Body: Buffer.from(dadosCsv)
    }, (erro, dados) => {
      if (erro) rejeitar(erro)
      else resolver(dados);
    })
  });
}

module.exports.simulandoUploadDeBucket = async () => {
  try {
    const caminhoArquivoCsv = path.join(__dirname, "cadastro_usuarios_1_aluno.csv");
    const dadosCsv = await readFile(caminhoArquivoCsv, "utf-8");

    const resultado = await criaBucketLocalComCsv(dadosCsv);

    if (resultado instanceof Error) throw resultado;

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Upload no Bucket local feito com sucesso." })
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
