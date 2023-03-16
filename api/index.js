const { parse } = require("fast-csv");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

module.exports.simulandoUploadDeBucket = async () => {
  try {
    const client = new S3Client({
      forcePathStyle: true,
      credentials: {
        accessKeyId: "S3RVER",
        secretAccessKey: "S3RVER"
      },
      endpoint: "http://localhost:4569"
    });

    await client.send(new PutObjectCommand({
      Bucket: "bucket-local",
      Key: "1234",
      Body: Buffer.from("abcd")
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

module.exports.cadastrarAlunos = async (evento, contexto) => {
  console.log("\n\nevento:");
  console.log(JSON.stringify(evento));

    // const s3 = new aws.S3();

    // const Bucket = evento.Records[0].s3.bucket.name;
    // const Key = decodeURIComponent(evento.Records[0].s3.object.key.replace(/\+/g, ' '));
    // const objetoBucket = await s3.getObject({ Bucket, Key }).promise();

    // const dadosCsv = objetoBucket.Body.toString("utf-8");

    // const resultado = await new Promise((resolver, rejeitar) => {
    //   const alunosPromessas = [];

    //   const stream = parse({ headers: ["nome", "matricula"], renameHeaders: true })
    //     .on("error", (erro) => rejeitar(erro))
    //     .on("data", (aluno) => {
    //       const promessa = fetch("http://ecs-django-186565849.us-east-1.elb.amazonaws.com/alunos", {
    //         method: "POST",
    //         body: JSON.stringify(aluno),
    //         headers: { 'Content-Type': 'application/json' }
    //       })

    //       alunosPromessas.push(promessa);
    //     })
    //     .on("end", () => {
    //       resolver(alunosPromessas);
    //     });

    //   stream.write(dadosCsv);
    //   stream.end();
    // });

    // if (Array.isArray(resultado)) {
    //   const alunos = await Promise.all(resultado);

    //   console.log({
    //     message: `${resultado.length} alunos foram cadastrados.`,
    //     alunos
    //   });
    // } else {
    //   console.log(resultado);
    // }
}
