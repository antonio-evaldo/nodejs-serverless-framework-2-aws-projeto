import { parse } from "fast-csv";
import { construirResposta } from "./utils.js";

export const cadastrarAlunos = async (evento) => {
  try {
    const dadosCsv = evento.body;

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
    return construirResposta(500, { message: erro.message });
  }
};
