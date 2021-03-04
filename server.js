/*
 * @Author: dfh
 * @Date: 2021-03-03 14:18:38
 * @LastEditors: dfh
 * @LastEditTime: 2021-03-03 14:23:30
 * @Modified By: dfh
 * @FilePath: /day25-react/server.js
 */
const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*");
    next();
})

app.get('/api/users', (req, res) => {
    const offset = parseInt(req.query.offset);
    const limit = parseInt(req.query.limit);
    const result = [];
    for (let i = offset; i < offset + limit; i++) {
        result.push({ id: i + 1, name: `name+${i + 1}` })
    }
    res.json(result);
})

app.listen(8000)