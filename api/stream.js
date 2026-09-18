import { promises as fs } from 'fs';
import path from 'path';

const CreateTimeout = (ms) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error("Timeout Rached")), ms)
);

export default async function handler(request, response) {
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');

    var { type, id } = request.query; // Eg: type="movie", id="tt1234567" or type="series", id="tt1234567:1:1"
    var season = undefined;
    var episode = undefined;

    if (type == "series") {
        const idSplited = id.split(":");
        
        id = idSplited[0];
        season = idSplited[1];
        episode = idSplited[2];
    }

    console.log("Type & ID", type, id, season, episode)

    try {
        const jsonPath = path.join(process.cwd(), 'api', 'saimuel-nuvio-repo', 'manifest.json'); // Ajuste o caminho se necessário
        const pluginsData = await fs.readFile(jsonPath, 'utf8');
        const plugins = JSON.parse(pluginsData);

        const pluginsAtivos = plugins.scrapers.filter(p => p.enabled === true);

        const promessasDeRaspagem = pluginsAtivos.map(async (plugin) => {
            try {
                const moduloPath = path.resolve(process.cwd(), 'api', 'saimuel-nuvio-repo', plugin.filename);
                const modulo = await import(moduloPath);
                
                return await modulo.getStreams(id, type, season, episode);
            } catch (err) {
                console.error(`Erro no plugin ${plugin.name}:`, err);
                return []; // Retorna lista vazia se um plugin específico falhar
            }
        });

        const execucaoDosScrapers = Promise.all(promessasDeRaspagem);

        const resultados = await Promise.race([
            execucaoDosScrapers,
            CreateTimeout(50000) 
        ]);

        const todosOsLinks = resultados.flat();
        console.log("Links Encontrados", todosOsLinks)

        const addonStreams = todosOsLinks.map(link => ({
            name: link.name || "Meu Addon",
            title: `[${link.quality || 'Auto'}] ${link.title}`,
            url: link.url
        }));

        return response.status(200).json({ streams: addonStreams });

    } catch (error) {
        console.error("Execução interrompida por erro ou timeout:", error.message);
        return response.status(200).json({ streams: [], note: "A requisição excedeu o tempo limite de 30s." });
    }
}