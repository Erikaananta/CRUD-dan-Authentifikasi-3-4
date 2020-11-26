const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql")
const md5 = require("md5")
const Cryptr = require("cryptr")
const crypt = new Cryptr("140533601726")
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "rent_car2"
    })
    
    db.connect(error => {
        if (error) {
            console.log(error.message)
        } else {
            console.log("MySQL Connected")
        }
})

// endpoint (authentication)
app.post("/karyawan/auth", (req, res) => {
    // tampung username dan password
    let param = [
        req.body.username, //username
        md5(req.body.password) // password
    ]
    

    // create sql query
    let sql = "select * from karyawan where username = ? and password = ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // cek jumlah data hasil query
        if (result.length > 0) {
            // user tersedia
            res.json({
                message: "Logged",
                token: crypt.encrypt(result[0].id_karyawan), // generate token
                data: result
            })
        } else {
            // user tidak tersedia
            res.json({
                message: "Invalid username/password"
            })
        }
    })
})

validateToken = () => {
    return (req, res, next) => {
        // cek keberadaan "Token" pada request header
        if (!req.get("Token")) {
            // jika "Token" tidak ada
            res.json({
                message: "Access Forbidden"
            })
        } else {
            // tampung nilai Token
            let token  = req.get("Token")
            
            // decrypt token menjadi id_karyawan
            let decryptToken = crypt.decrypt(token)

            // sql cek id_karyawan
            let sql = "select * from karyawan where ?"

            // set parameter
            let param = { id_karyawan: decryptToken}

            // run query
            db.query(sql, param, (error, result) => {
                if (error) throw error
                 // cek keberadaan id_karyawan
                if (result.length > 0) {
                    // id_karyawan tersedia
                    next()
                } else {
                    // jika user tidak tersedia
                    res.json({
                        message: "Invalid Token"
                    })
                }
            })
        }

    }
}



//MOBIL

app.get("/mobil", validateToken(), (req, res) => {
        // create sql query
        let sql = "select * from mobil"
    
        // run query
        db.query(sql, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
                }            
            } else {
                response = {
                    count: result.length, // jumlah data
                    mobil: result // isi data
                }            
            }
            res.json(response) // send response
        })
})

app.get("/mobil/:id", (req, res) => {
        let data = {
            id_mobil: req.params.id
        }
        // create sql query
        let sql = " select * from mobil where?"
    
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
                }            
            } else {
                response = {
                    count: result.length, // jumlah data
                    mobil: result // isi data
                }            
            }
            res.json(response) // send response
        })
})

app.post("/mobil", (req,res) => {

        // prepare data
        let data = {
            id_mobil: req.body.id_mobil,
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_perhari: req.body.biaya_sewa_perhari,
            image: req.body.image
        }
    
        // create sql query insert

    let sql = `
        insert into mobil (id_mobil, nomor_mobil, merk, jenis, warna, tahun_pembuatan, biaya_sewa_perhari, image)
        values ('`+data.id_mobil+`', '`+data.nomor_mobil+`', '`+data.merk+`', '`+data.jenis+`', '`+data.warna+`','`+data.tahun_pembuatan+`', '`+data.biaya_sewa_perhari+`', '`+data.image+`')
    `
    
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data inserted"
                }
            }
            res.json(response) // send response
        })
})

app.put("/mobil/:id", (req,res) => {

        let data = req.body

        let sql = `
        update mobil set
        nomor_mobil ='`+data.nomor_mobil+`', merk ='`+data.merk+`', jenis ='`+data.jenis+`', warna ='`+data.warna+`', tahun_pembuatan ='`+data.tahun_pembuatan+`', biaya_sewa_perhari ='`+data.biaya_sewa_perhari+`', image ='`+data.image+`'
        where id_mobil = '`+req.params.id+`'
        ` 

        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data updated"
                }
            }
            res.json(response) // send response
        })
})

app.delete("/mobil/:id", (req,res) => {
        let data = {
            id_mobil: req.params.id
        }
    let sql = `
    delete from mobil
    where id_mobil = '`+req.params.id+`'
    `
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data deleted"
                }
            }
            res.json(response) // send response
        })
})

//KARYAWAN
app.get("/karyawan", validateToken(), (req, res) => {
        // create sql query
        let sql = "select * from karyawan"
    
        // run query
        db.query(sql, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
                }            
            } else {
                response = {
                    count: result.length, // jumlah data
                    karyawan: result // isi data
                }            
            }
            res.json(response) // send response
        })
})

app.get("/karyawan/:id", (req, res) => {
        let data = {
            id_karyawan: req.params.id
        }
        // create sql query
        let sql = " select * from karyawan where?"
    
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
                }            
            } else {
                response = {
                    count: result.length, // jumlah data
                    karyawan: result // isi data
                }            
            }
            res.json(response) // send response
        })
})

app.post("/karyawan", (req,res) => {

        // prepare data
        let data = req.body

    
        // create sql query insert

    let sql = `
        insert into karyawan (id_karyawan, nama_karyawan, alamat_karyawan, kontak, username, password)
        values ('`+data.id_karyawan+`', '`+data.nama_karyawan+`', '`+data.alamat_karyawan+`', '`+data.kontak+`', '`+data.username+`','`+data.password+`')
    `
    
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data inserted"
                }
            }
            res.json(response) // send response
        })
})

app.put("/karyawan/:id", (req,res) => {

        let data = req.body

        let sql = `
        update karyawan set
        nama_karyawan ='`+data.nama_karyawan+`', alamat_karyawan ='`+data.alamt_karyawan+`', kontak ='`+data.kontak+`', username = '`+data.username+`', password ='`+data.password+`'
        where id_karyawan = '`+req.params.id+`'
        ` 

        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data updated"
                }
            }
            res.json(response) // send response
        })
})

app.delete("/karyawan/:id", (req,res) => {
        let data = {
            id_karyawan: req.params.id
        }
    let sql = `
    delete from karyawan
    where id_karyawan = '`+req.params.id+`'
    `
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data deleted"
                }
            }
            res.json(response) // send response
        })
})

//PELANGGAN
app.get("/pelanggan", validateToken(), (req, res) => {
        // create sql query
        let sql = "select * from pelanggan"
    
        // run query
        db.query(sql, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
                }            
            } else {
                response = {
                    count: result.length, // jumlah data
                    pelanggan: result // isi data
                }            
            }
            res.json(response) // send response
        })
})

app.get("/pelanggan/:id", (req, res) => {
        let data = {
            id_pelanggan: req.params.id
        }
        // create sql query
        let sql = " select * from pelanggan where?"
    
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
                }            
            } else {
                response = {
                    count: result.length, // jumlah data
                    pelanggan: result // isi data
                }            
            }
            res.json(response) // send response
        })
})

app.post("/pelanggan", (req,res) => {
        let data = req.body

        let sql = `
            insert into pelanggan (id_pelanggan, nama_pelanggan, alamat_pelanggan, kontak)
            values ('`+data.id_pelanggan+`', '`+data.nama_pelanggan+`', '`+data.alamat_pelanggan+`', '`+data.kontak+`')
        `
    
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data inserted"
                }
            }
            res.json(response) // send response
        })
})

app.put("/pelanggan/:id", (req,res) => {

        let data = req.body

        let sql = `
        update pelanggan set
        nama_pelanggan = '`+data.nama_pelanggan+`', alamat_pelanggan ='`+data.alamat_pelanggan+`', kontak ='`+data.kontak+`'
        where id_pelanggan = '`+req.params.id+`'
        ` 

        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data updated"
                }
            }
            res.json(response) // send response
        })
})

app.delete("/pelanggan/:id", (req,res) => {
        let data = {
            id_pelanggan: req.params.id
        }
    let sql = `
    delete from pelanggan
    where id_pelanggan = '`+req.params.id+`'
    `
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data deleted"
                }
            }
            res.json(response) // send response
        })
})

//Transaksi

app.post('/sewa/:id/take', validateToken(), (req, res) => {
    let data = req.body

    db.query(`
        insert into sewa (id_sewa, id_mobil, id_karyawan, id_pelanggan, tgl_sewa, tgl_kembali, total_bayar)
        values ('`+data.is_sewa+`','`+req.params.id+`', '`+req.params.id_pelanggan+`', '`+data.tgl_sewa+`', '`+data.tgl_kembali+`', '`+data.total_bayar+`')
    `, (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "Car has been taked"
    })
})

app.delete("/sewa/:id", (req,res) => {
        let data = {
            id_sewa: req.params.id
        }
    let sql = `
    delete from sewa
    where id_sewa = '`+req.params.id+`'
    `
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message
                }
            } else {
                response = {
                    message: result.affectedRows + " data deleted"
                }
            }
            res.json(response) // send response
        })
})


app.listen(8000, () => {
        console.log("Run on port 8000")
 })
