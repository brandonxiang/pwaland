import { FastifyInstance } from "fastify";
import { fetchNotionData, parseNotionMultiSelect, parseNotionRichText, parseNotionTitle, parseNotionUrl, PWADatabaseId } from "../../model/notion";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

// type PwalandTable = {
//   description: string;
//   tags: string[];
//   link: string;
//   icon: string;
//   title: string;
// }[];


// const pwalandTable: PwalandTable = [];

function ClientListRouter(fastify: FastifyInstance, _: any, done: any) {
  fastify.post<{
    Body: {
      start_cursor?: string;
    };
  }>('/list', {
    schema: {
      body: {
        type: 'object',
        properties: {
          start_cursor: { type: 'string' }
        }
      }
    }
  }, async (req, res) => {
    const { start_cursor } = req.body;
    const response = await fetchNotionData(PWADatabaseId, start_cursor);
    const results = response.results as DatabaseObjectResponse[];
    const { has_more, next_cursor } = response;

    const properties = results.map(s => s.properties).map(s => {
      return {
        description: parseNotionRichText(s['description']),
        tags: parseNotionMultiSelect(s['tags']),
        link: parseNotionUrl(s['link']),
        icon: parseNotionUrl(s['icon']),
        title: parseNotionTitle(s['title']),
      };
    });

    return res.send({ properties, has_more, next_cursor });
  });

  done();
}


export default ClientListRouter;