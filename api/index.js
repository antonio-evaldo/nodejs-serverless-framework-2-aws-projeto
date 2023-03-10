import { parse } from "fast-csv";
import { construirResposta, obterBoundary, parsearMultipartBody } from "./utils.js";

export const cadastrarAlunos = async (evento) => {
  try {

    const boundary = obterBoundary(evento);

    const parts = parsearMultipartBody(evento.body, boundary);
    
    const dadosCsv = parts[0].body;

    const resultado = await new Promise((resolver, rejeitar) => {
      const stream = parse({ headers: ["nome", "matricula"], renameHeaders: true })
      .on("error", (erro) => rejeitar(erro))
      .on("data", (aluno) => {
        console.log(aluno);
        // Chamar API para cadastrar aluno...
      })
      .on("end", (linhasConvertidas) => {
        resolver({ message: `Conversão realizada com sucesso: ${linhasConvertidas} linhas foram convertidas.` })
      });

      stream.write(dadosCsv);
      stream.end();
    });

    if (resultado instanceof Error) {
      return construirResposta(422, resultado);
    }

    return construirResposta(201, resultado);
  } catch (erro) {
    console.log(erro);
    return construirResposta(500, { message: erro.message });
  }
};
