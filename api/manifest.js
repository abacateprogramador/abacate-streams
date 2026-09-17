export default function handler(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Access-Control-Allow-Origin', '*');
  
  const manifest = {
    id: "io.abacateprogramador.nuvio",
    version: "1.0.0",
    name: "Abacate Streams",
    description: "Addon para hospedagem do plugin saimuel-nuvio-repo",
    resources: ["stream"], 
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
  };

  return response.status(200).json(manifest);
}
