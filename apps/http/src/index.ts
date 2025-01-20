import express from "express";
import UserRouter from "./routes/v1/user-router";
const app =  express()
app.use(express.json())
app.use('/api/v1',UserRouter)

app.listen(9000,()=>{
    console.log('Server is running on http://localhost:9000')
})