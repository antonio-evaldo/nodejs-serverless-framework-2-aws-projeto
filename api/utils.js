function construirResposta(status, body, headers) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  }
}

function obterBoundary(evento) {
  const contentType = evento.headers["content-type"];

  const prefixoBoundary = "multipart/form-data; boundary=";

  if (contentType.startsWith(prefixoBoundary)) {
    const boundary = contentType.slice(prefixoBoundary.length);

    return boundary;
  }
}

function parsearMultipartBody(body, boundary) {
  return body.split(`--${boundary}`).reduce((parts, part) => {
    if (part && part !== '--') {
      const [ head, body ] = part.trim().split(/\r\n\r\n/g)
      parts.push({
        body: body,
        headers: head.split(/\r\n/g).reduce((headers, header) => {
          const [ key, value ] = header.split(/:\s+/)
          headers[key.toLowerCase()] = value
          return headers
        }, {})
      })
    }
    return parts
  }, [])
}

export {
  construirResposta,
  obterBoundary,
  parsearMultipartBody
};
