import { FastifyInstance } from 'fastify';
import { success } from '../../utils';
import { Client } from '@notionhq/client';
import fs from 'fs';
import { CRAWLER_TAGS } from '../../consts/crawler';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const token = 'CfDJ8PNhbTKpPf1GhYfHgzDUPUqG8cTDr08l8UkJ_fNGckfibfkT0nv8qRrC26qfspoptRsdYkECe3JKi_yOeELjUkUkM6ffQCYSqj2ltFTniyzkNeDDAW_fFblL6KacllRvRjL3KCXETCzdAf38SJlTaJs';
const databaseId = 'a39d3843c07f43cfa79c43ff7cf88c47';
const notionApiKey = 'secret_G3MTRaQ29phFKeohjPVzQTfdhS7m841NgUqtRpmMWyw';

const notion = new Client({
    auth: notionApiKey,
});

async function fetchPwaList(body: any) {
    const response = await fetch('https://pwapp.net/api/Pwa/List', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    return data;
}

async function fetchNotionData(start_cursor?: string) {
    const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
            {
              "property": "title",
              "direction": "ascending"
            }
          ],
        start_cursor: start_cursor? start_cursor : undefined,
      });
      return response;
}


export default (fastify: FastifyInstance, _: any, done: any) => {
    fastify.post<{
        Body: {
            url: string;
        };
    }>('/crawler', {
        schema: {
            body: {
                type: 'object',
                required: ['url'],
                properties: {
                    url: { type: 'string' }
                }
            }
        }
    }, async (req, res) => {

        const data = await fetchPwaList({
            isRecommend: true,
            category: null,
            __RequestVerificationToken: token
        });

        fs.writeFileSync(`data/pwaapp${0}.json`, JSON.stringify(data, null, 2));

        const num = 16;
        for (let i = 1; i < num + 1; i++) {
            console.log(`crawler ${i}`);

            const data = await fetchPwaList({
                isRecommend: false,
                category: i,
                __RequestVerificationToken: token
            });

            fs.writeFileSync(`data/pwaapp${i}.json`, JSON.stringify(data, null, 2));
        }
        res.send(success('hello world'));

    });

    fastify.get('/readFromNotion', async (req, res) => {
        const response = await notion.databases.query({
            database_id: databaseId,
        });
        const tableData =  /** @type {Array<import('@notionhq/client/build/src/api-endpoints').DatabaseObjectResponse>} */ (response.results);
        // const properties = tableData.map(s => s.properties);
        console.log(1111, tableData)
        res.send(tableData);
    });

    fastify.post('/writeToNotion', async (req, res) => {

        for (let i = 0; i < 16 + 1; i++) {
            const res = fs.readFileSync(`data/pwaapp${i}.json`, { encoding: 'utf-8' });
            const resObj = JSON.parse(res);
            console.log(resObj.data);

            resObj.data.forEach(async (item: { url: string, iconUrl: string, name: string, category: number, description: string }) => {

                try {
                    const response = await notion.pages.create({
                        "parent": {
                            "type": "database_id",
                            "database_id": databaseId
                        },
                        "properties": {
                            "link": {
                                "type": "url",
                                "url": item.url
                            },
                            "icon": {
                                "type": "url",
                                "url": item.iconUrl
                            },
                            "title": {
                                "title": [
                                    {
                                        "text": {
                                            "content": item.name
                                        }
                                    }
                                ]
                            },
                            "Tags": {
                                "type": "multi_select",
                                "multi_select": [
                                    {
                                        "name": CRAWLER_TAGS[item.category] || '未分类',
                                        "color": "default"
                                    }
                                ]
                            },
                            "description": {
                                "type": "rich_text",
                                "rich_text": [
                                    {

                                        "text": {
                                            "content": item.description,
                                        },
                                    },
                                ],
                            },
                        }
                    });
                    console.log("success to insert ", item.name);
                } catch (error) {
                    console.log("failed to insert ", item.name);
                }

            });
        }

        res.send(success(1));
    });

    fastify.get('/removeDuplicated', async (req, res) => {
        const cachePages: PageObjectResponse[] = [];
        const removeList: string[] = [];
        const cacheList = new Map<string, number>();

        let name = '';

        let hasMore = true;
        let nextCursor = '';

        while(hasMore) {
            const response = await fetchNotionData(nextCursor);
            const {results, has_more, next_cursor} = response;
            hasMore = has_more;
            nextCursor = next_cursor ? next_cursor : '';
            cachePages.push(...results as PageObjectResponse[]);
            console.log('This notion data has more, nextCursor is ', nextCursor);
        }
   
 
          console.log(1111, cachePages);
          cachePages.forEach((item: any, index: number) => {
            name = item.properties.title.title[0].text.content;
            if(cacheList.has(name)) {
                removeList.push(item.id);
            } else {
                cacheList.set(name, index);
            }
          });
          console.log(removeList);
          

          removeList.forEach(async (pageId) => {
            await notion.pages.update({
                page_id: pageId,
                archived: true, // or in_trash: true
              });
            console.log('Now remove duplicated page, pageId is ', pageId);
          });

  
  
        // const tableData =  /** @type {Array<import('@notionhq/client/build/src/api-endpoints').DatabaseObjectResponse>} */ (response.results);
        // const properties = tableData.map(s => s.properties);
        res.send(success(1));
    });

    done();
};