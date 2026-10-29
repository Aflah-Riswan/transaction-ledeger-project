import express from 'express'
import cors from 'cors'

export function createApp(){
    const app = express()

    app.use(cors({
        origin:process.env.FRONTEND_ORIGIN 
    }))
    app.use(express.json())
    app.get('/api/health',(req,res)=>{
        res.status(200).json({
            success : true,
            message : 'server is healthy'
        })
    })
    return app
}