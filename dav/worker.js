addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter');
    const index = url.searchParams.get('index');

    // 从第一个来源获取 JSON 数据
    const response1 = await fetch('http://www.fish2018.us.kg/p/jsm.json') // 替换为实际的 JSON 数据来源
    const jsonData1 = await response1.json()

    // 从第二个来源（网页）获取 JSON 数据
    const response2 = await fetch('http://www.fish2018.us.kg/z/FongMi.json') // 替换为实际的网页 JSON 数据来源
    const jsonData2 = await response2.json()

    // 从第一个 JSON 数据中提取 zip 值
    const siteWithZip1 = jsonData1.sites.find(site => site.zip)
    if (!siteWithZip1) {
      return new Response(JSON.stringify({ error: 'No zip found in first source' }), { status: 404 })
    }

    // 解析版本号（示例中为 20250212-1117）
    const version = siteWithZip1.zip.match(/\d{8}-\d{4}/)?.[0] || 'unknown'

    // 从第二个 JSON 数据中提取 zip 值
    const siteWithZip2 = jsonData2.sites.find(site => site.zip)
    if (!siteWithZip2) {
      return new Response(JSON.stringify({ error: 'No zip found in second source' }), { status: 404 })
    }

    // 解析第二个来源的版本号
    const version2 = siteWithZip2.zip.match(/\d{8}/)?.[0] || 'unknown'

    // 根据请求参数返回不同结果
    if (!filter) {
      // 不带参数时返回现在的结果
      const newJson = [
        {
          "name": "update",
          "list": [
            {
              "name": "pg",
              "url": siteWithZip1.zip,
              "icon": "",
              "version": version
            },
            {
              "name": "ZX",
              "url": siteWithZip2.zip,
              "icon": "",
              "version": version2
            }
          ]
        }
      ];
      return new Response(JSON.stringify(newJson, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (filter &&!index) {
      // 只带 filter 参数时
      if (filter === 'pg') {
        const newJson = [
          {
            "name": "update",
            "list": [
              {
                "name": "pg",
                "url": siteWithZip1.zip,
                "icon": "",
                "version": version
              }
            ]
          }
        ];
        return new Response(JSON.stringify(newJson, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (filter === 'ZX') {
        const newJson = [
          {
            "name": "update",
            "list": [
              {
                "name": "ZX",
                "url": siteWithZip2.zip,
                "icon": "",
                "version": version2
              }
            ]
          }
        ];
        return new Response(JSON.stringify(newJson, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid filter value' }), { status: 400 });
      }
    } else if (filter && index) {
      const dataMap = {
        pg: { url: siteWithZip1.zip, version },
        ZX: { url: siteWithZip2.zip, version: version2 }
      };
      const selectedData = dataMap[filter];
      if (selectedData && selectedData[index]) {
        if (index === 'url') {
          // 重定向到 url
          return Response.redirect(selectedData[index], 302);
        } else {
          return new Response(selectedData[index], {
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      }
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), { status: 400 });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid request parameters' }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching or parsing JSON' }), { status: 500 });
  }
}
