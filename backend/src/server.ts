
import 'dotenv/config';
import  { createApp } from './app'


const app = createApp()
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT,(err)=>{
    if(err){
        console.log(" error found  : ",err)
    }
    console.log("server is runninng on the port ",PORT)
})
