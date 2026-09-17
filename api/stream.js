import { getStreams } from './saimuel-nuvio-repo/providers/fshd';

export default async function handler(request, response) {
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    
    const { type, id } = request.query; // Eg: type="movie", id="tt1234567" or type="series", id="tt1234567:1:1"
    console.log("Type & ID", type, id)

    try {
        const linksEncontrados = await getStreams(id, type, undefined, undefined);
        const addonStreams = linksEncontrados.map(link => {
        return {
            name: link.name,
            title: `[${link.quality}] ${link.title}`, 
            url: link.url
        };
        });

        return response.status(200).json({
            streams: addonStreams
        });

    } catch (error) {
        return response.status(200).json({ streams: [] });
    }
}
