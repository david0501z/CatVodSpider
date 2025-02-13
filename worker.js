//cloudflare worker代码从在线包获取下载地址，返回json


addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
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

    // 构造新的 JSON 结构
    const newJson = [
      {
       "name": "update",
      "list": [
         {
          "name": "pg",
          "url": siteWithZip1.zip,
          "icon": "",
          "version":version                                                          
        },
        {
          "name": "ZX",
          "url": siteWithZip2.zip,
          "icon": "",
"version":version2// 解析第二个来源的版本号 
}
      ]                                                                                                 
      }
    ]                                                                                                           



    // 返回新的 JSON 结构
    return new Response(JSON.stringify(newJson, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching or parsing JSON' }), { status: 500 })
  }
}
