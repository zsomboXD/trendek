import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import {configDB } from './configDB.js'

const port = 3000

let connection
try {
    connection = await mysql.createConnection(configDB)
} catch (error) {
    console.log(error);
}

const app = express()
app.use(express.json())
app.use(cors())

app.get("/api/trends/:id",async (req,res)=>{
    const {id} = req.params
    try {
        const sql = 'SELECT * FROM categories INNER join trends on categories.id = trends.categId where categories.id = ? order by trends.name desc'
        const [rows] = await connection.execute(sql,[id])
        res.send(rows)
    } catch (error) {
        console.log(error);
    }
})

app.get("/api/search/:keyword",async(req,res)=>{
    const {keyword} = req.params
    try {
        const sql ='select * from trends where instr(trends.name,?)'
        const [rows] = await connection.execute(sql,[keyword])
        res.send(rows) 
    } catch (error) {
        console.log(error);
    }
})

app.get("/api/categories",async(req,res)=>{
    try {
        const sql = "select * from categories"
        const [rows] = await connection.execute(sql)
        res.send(rows)
    } catch (error) {
        console.log(error);
        
    }
})

app.post("/api/categories",async(req,res)=>{
    const {name,description,categId,impact,year,imageUrl} = req.body
    try {
        const sql = "insert into trends values (?,?,?,?,?,?,?)"
        const values = [null,name,description,categId,impact,year,imageUrl]
        const [rows] = await connection.query(sql,values)
        res.status(201).json({msg:"Sikeres hozzáadás!"})
    } catch (error) {
        console.log(error);
    }
})

app.put("/api/impact/:id",async(req,res)=>{
    const {id} = req.params
    const {impact} = req.body
    try {
        const sql = "update trends set impact = ? where id = ?"
        const [rows] = await connection.query(sql,[impact, id])
        if(rows.affectedRows == 0) return res.status(404).json({msg:"A módosítandó érték nem található!"})
            else res.status(200).json({msg:"Sikeres módosítás!"})
    } catch (error) {
        console.log(error);
    }
})

app.listen(port, ()=>console.log(`Szerver fut a ${port} porton.`))