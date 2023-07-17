const express = require('express')
const cors = require('cors')
const mongoDBConnection = require('./connection')
const app = express()
const dotenv = require('dotenv')
const router = require('./routes/route')
dotenv.config()
const PORT = process.env.PORT || 3000


app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoDBConnection.connectToCluster()

app.use(router)

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
})
