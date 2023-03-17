const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { readFile } = require("fs/promises");
const { join } = require('path');

const { converteDadosCsv } = require("../converteDadosCsv");
const { cadastrarAlunosNoBd } = require("../cadastrarAlunosNoBd");

async function criaBucketLocalComCsv(dadosCsv) {
  const cliente = new S3Client({
    forcePathStyle: true,
    credentials: {
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
    },
    endpoint: "http://localhost:4569",
  });

  const comandoUploadObjeto = new PutObjectCommand({
    Bucket: "alunos-csv-local",
    Key: "1234",
    Body: Buffer.from(dadosCsv)
  })

  await cliente.send(comandoUploadObjeto);
}

module.exports.simulandoUploadDeBucket = async () => {
  try {
    const caminhoArquivoCsv = join(__dirname, "cadastro_usuarios_1_aluno.csv");
    const dadosCsv = await readFile(caminhoArquivoCsv, "utf-8");

    await criaBucketLocalComCsv(dadosCsv);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Upload no Bucket local feito com sucesso." })
    }
  } catch (erro) {
    return {
      statusCode: erro.statusCode || 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(erro)
    }
  }
};

// Disparada no upload do Bucket local
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
