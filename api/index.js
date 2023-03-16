const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { readFile } = require("fs/promises");
const { processaCsv } = require("./processaCsv");

module.exports.simulandoUploadDeBucket = async () => {
  try {
    const cliente = new S3Client({
      forcePathStyle: true,
      credentials: {
        accessKeyId: "S3RVER",
        secretAccessKey: "S3RVER"
      },
      endpoint: "http://localhost:4569"
    });

    const dadosCsv = await readFile(`../cadastro_usuarios.csv`, "utf-8");

    await cliente.send(new PutObjectCommand({
      Bucket: "bucket-local",
      Key: "1234",
      Body: Buffer.from(dadosCsv)
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "Upload de Bucket local feito com sucesso." })
    }
  } catch (erro) {
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

    // const cliente = new S3Client();

    // const objetoBucket = await cliente.send(
    //   new GetObjectCommand({ Bucket, Key })
    // );

    // const dadosCsv = objetoBucket.Body.toString("utf-8");

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
