const http = require ("http")

let server = http.createServer((require, response) => {

    console.log("URL: ", require.url);
    console.log("Method: ", require.method);

    switch (require.url){

        case '/':
            response.statusCode = 200;
            response.setHeader("Content-type", "text/html");
            response.end("<h1>Olá Mundo</h1>");
            break;

        case '/users':
            response.statusCode = 200;
            response.setHeader("Content-type", "application/json");
            response.end(JSON.stringify({
                users:[{
                    name: "Thiago",
                    email: "thiagoteixeira.ps@gmail.com",
                    id:1
                }]
            }));
            break;

    }

})

server.listen(3000, '127.0.0.1', () => {

    console.log('Servidor rodando')

})

