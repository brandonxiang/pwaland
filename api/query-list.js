import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req, res) {
  const databaseId = 'a39d3843c07f43cfa79c43ff7cf88c47';

  const response = await notion.databases.query({
    database_id: databaseId,
  });


  const tableData =  /** @type {Array<import('@notionhq/client/build/src/api-endpoints').DatabaseObjectResponse>} */ (response.results);

  const properties = tableData.map(s => s.properties);

  const result = properties.map(p => {
    /** @type {*} */
    let target = {};
    Object.keys(p).forEach(key => {
      if(key) {
        const value = p[key];
        target[key] = parseNotionObj(value);
      }
    });
    return target;
  })
  
  console.log(JSON.stringify(result, undefined, 2));
  res.status(200).json({result});
};

/**
 * 
 * @param {*} item 
 * @returns { string }
 */
const parseNotionObj = (item) => {
  if(item.type === 'title') {
    if(item.title && item.title.length > 0) {
      return item.title[0].plain_text;
    }
  } else if(item.type === 'url') {
    return item.url;
  }
  return '';
}