async function cadastrarAlunosNoBd(alunos) {
  const promessasAlunos = alunos.map((aluno) => {
    return fetch("http://ecs-django-186565849.us-east-1.elb.amazonaws.com/alunos", {
      method: "POST",
      body: JSON.stringify(aluno),
      headers: { 'Content-Type': 'application/json' }
    });
  });

  await Promise.all(promessasAlunos);
}

module.exports = { cadastrarAlunosNoBd };