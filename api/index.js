const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { readFile } = require("fs/promises");
const { parse } = require("fast-csv");

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

    const resultado = await new Promise((resolver, rejeitar) => {
      const alunosPromessas = [];

      const stream = parse({ headers: ["nome", "matricula"], renameHeaders: true })
        .on("error", (erro) => rejeitar(erro))
        .on("data", (aluno) => {
          const promessa = fetch("http://ecs-django-186565849.us-east-1.elb.amazonaws.com/alunos", {
            method: "POST",
            body: JSON.stringify(aluno),
            headers: { 'Content-Type': 'application/json' }
          })

          alunosPromessas.push(promessa);
        })
        .on("end", () => {
          resolver(alunosPromessas);
        });

      stream.write(dadosCsv);
      stream.end();
    });

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
