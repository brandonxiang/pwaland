import { FastifyInstance } from "fastify";
import { fetchNotionData, parseNotionMultiSelect, parseNotionRichText, parseNotionTitle, parseNotionUrl, StarterDatabaseId } from "../../model/notion";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

function StarterListRouter(fastify: FastifyInstance, _: any, done: any) {
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
      const response = await fetchNotionData(StarterDatabaseId, start_cursor);
      const results = response.results as DatabaseObjectResponse[];
      const { has_more, next_cursor } = response;
  
      const properties = results.map(s => s.properties).map(s => {
        return {
          description: parseNotionRichText(s['description']),
          tag: parseNotionMultiSelect(s['tag']),
          github: parseNotionUrl(s['github']),
          key: parseNotionRichText(s['key']),
          name: parseNotionTitle(s['name']),
        };
      });
  
      return res.send({ properties, has_more, next_cursor });
    });
  
    done();
  }

  export default StarterListRouter;