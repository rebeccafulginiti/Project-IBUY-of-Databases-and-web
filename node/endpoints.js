require('dotenv').config()
const pg = require("pg")
const bcrypt = require("bcrypt")
const {SignJWT, jwtVerify, decodeJwt} = require('jose')
//doc end si può mettere
const jwt_secret = process.env.DB_jwt_secret
const jwt_key = new TextEncoder().encode(jwt_secret)

const pool = new pg.Pool({
 user: process.env.DB_USER,
 host: process.env.DB_HOST,
 database: process.env.DB_DATABASE,
 password: process.env.DB_PASSWORD,
 port: parseInt(process.env.DB_PORT) 

})

module.exports = function(app) {
//sessioni + autenticazioni + creazione di nuovo user 
    app.post('/users', registerNewUser)
    app.post('/sessions', login)
    app.patch('/sessions', refresh)
    app.delete('/sessions', auth, logout)
//vendors
    app.get('/vendors', auth, getVendors)
    app.get('/vendors/:username', auth,  getVendorProfile)
    app.get('/vendors/:username/image', auth, getVendorProfilePhoto)
    app.get('/vendors/:username_vendor/products', auth, getVendorProducts)
//profile (me) + my image
    app.get('/me', auth, getMe)
    app.get('/me/image', auth, getMyPhoto)
    app.post('/me/image', auth, postMyPhoto)
    app.patch('/me', auth , patchMe )
// my purchases
    app.get('/purchases',auth, getMyPurchases)
    app.post('/purchases',auth, postMyNewPurchase)
//follows 
// ---> followers
    app.get('/followers',auth, getMyFollowers)
// ---> following
    app.get('/followings', auth, getMyFollowings)
    app.post('/followings',auth, postMyNewFollowings)
    app.delete('/followings/:following',auth, deleteFollowing) 
//products + my product image
    app.get('/products', getProducts)
    app.post('/products', auth, postNewProduct)
    app.get('/products/:product_id', getSingleProduct)
    app.get('/products/:product_id/image', getSinglePhotoProduct)
    app.post('/products/:product_id/image', auth,  postMyPhotoProduct)
    app.patch('/products/:product_id', auth, patchMyProduct)
}

//sessioni + autenticazioni + creazione di nuovo user +link iperetstuali 
const auth = async (req,res,next) => {
// #swagger.security = [{"bearerAuth" : [] }] //serve per far funzionare lo swagger
if (!req.headers.authorization) {
    return res.status(400).send({message :"Not authenticated - no token "})
}
 const token = req.headers.authorization.split(' ')[1];
 // verifica se qusto token funziona con jwtVerify con al password del server 
    try{
        const {payload}= await jwtVerify(token, jwt_key)
        req.user = payload.username
           next()
    } catch(err) {
        return res.status(401).send({message : 'Token old or invalid'})
    }


}
// funzione che mi crea i link HATEOAS per i Products che funzionano perchè ti piace compliacarti la vita
const linkGeneratorProducts = (product, current_product_id) => {
    // pensiamo al fatto che dobbiamo definire questi link 
    //ricordati che i product_LNK >> è il prodotto sepcifico non la lista dei prodotti  che vende il vendor 
    // se invece è al pluarle sono la lista 
    const links = {
        "image_LNK" : {
         "href": `/products/${product.product_id}/image`,
        "method" : "GET"
        },
        "vendor_LNK" : {
        "href" :`/users/vendors/${product.username_vendor}`,
        "method": "GET"
        },
        "list_products_LNK" : {
        "href" :`/users/vendors/${product.username_vendor}/products`,
        "method": "GET"
        }

    }
    // facciamo un controllo così questa funzione la posso usare  anche nel singolo prodotto e non creare un loop di link ipertestuali facendo ritornare sempre il product_lnk 
     if (current_product_id !== product.product_id) {
         links.product_LNK = {
         "href": `/products/${product.product_id}`,
         "method" : "GET"
         }
     }


    return links

}
// funzione che mi crea i link HATEOAS  per i vendors che funzionano perchè ti piace compliacarti la vita
const linkGeneratorVendors = (vendor,user_logged) => {
    // pensiamo al fatto che dobbiamo definire questi link 
    //ricordati che i products_LNK >> è la lista dei prodotti  che vende il vendor 
    const links = {
        "image_LNK" : {
         "href": `/vendors/${vendor.username_vendor}/image`,
        "method" : "GET"
        },
        "list_products_LNK" : {
        "href" :`/vendors/${vendor.username_vendor}/products`,
        "method": "GET"
        }
    }
   if (user_logged === vendor.username_vendor) {
        links.patch = {
            "href": `/vendors/${vendor.username_vendor}`,
            "method" : "PATCH"
        }
        
        links.purchase_LNK = {
            "href": `/purchases/${vendor.username_vendor}`,
            "method": "GET"
        }

        links.followings_LNK = {
            "href": `/followings/${vendor.username_vendor}`,
            "method": "GET"
        }
        links.followers_LNK = {
                "href": `/followers/${vendor.username_vendor}`,
                "method": "GET"
            }
        
    }
    // facciamo un controllo così questa funzione la posso usare  anche nel singolo vendor e non creare un loop di link ipertestuali facendo ritornare sempre il vendor_LNK 
    //lo facciamo ritornare sempre solo se siamo nella collezione /users/vendors
     if (user_logged !== user.username_vendor) {
         links.vendor_LNK = {
        "href" :`/vendors/${user.username_vendor}`,
        "method": "GET"
         }
     }


    return links

}

const registerNewUser = async (req, res) => {
// #swagger.tags = ['Authentication']
// #swagger.summary = 'Sign up'
// #swagger.description = 'Handles the registration of a new user account. Expects user data within the request body.'
if (!req.body) {
      return res.status(400).send({message: "Bad Request: No body provided"})
    } 
// facciamo un po' di controlli sulle possibili bad request 

// controllo username
    if (!req.body.username || req.body.username.toString().trim() === "" ) {
        return res.status(400).send({message : "Bad request: Username cannot be empty!"})
    }

    if (req.body.username.toString().length >20 )  {
        return res.status(400).send({message : "Bad request: Username must be a string of no more than 20 characters!"})
    }
// controllo mail 
    if (!req.body.mail || req.body.mail.toString().trim() === "" ) {
        return res.status(400).send({message : "Bad request: Mail cannot be empty!"})
    }

    if ( req.body.mail.toString().length >40 )  {
       return res.status(400).send({message : "Bad request: Mail must be a string of no more than 40 characters!"})
    }
// controllo la street se c'è
    if (req.body.street !== undefined && req.body.street !== null && req.body.street.toString().trim() !== "" ) {
            if (req.body.street.toString().length > 25) {
                return  res.status(400).send({message: "Bad Request: You have entered a name of a street that's too long!"})
            }
        }
 // controllo la city  se c'è
    if (req.body.city !== undefined && req.body.city !== null &&req.body.city.toString().trim() !== "" ) {
            if (req.body.city.toString().length > 15) {
                return  res.status(400).send({message: "Bad Request: You have entered a name of a city that's too long!"})
            }
        }
 // controllo lo zip_code se c'è
    if (req.body.zip_code !== undefined && req.body.zip_code !== null && req.body.zip_code.toString().trim() !== ""){
            if (isNaN(Number(req.body.zip_code.toString().trim()))) {
                return  res.status(400).send({message: "Bad Request: You have entered a zip_code that's invalid!"})
            }
            if (req.body.zip_code.toString().trim().length !== 5) {
               return  res.status(400).send({message: "Bad Request: You have entered a zip_code that's invalid!"})
            }
        }
// controllo lo street number se c'è
    if (req.body.street_number !== undefined && req.body.street_number !== null && req.body.street_number.toString().trim() !== "" ) {
            if (isNaN(Number(req.body.street_number))|| (req.body.street_number < 0 || req.body.street_number > 999 )) {
                return  res.status(400).send({message: "Bad Request: You have entered a street number that's invalid!"})
            }
        }
// controllo apartament floor
    if (req.body.apartment_floor !== undefined && req.body.apartment_floor !== null && req.body.apartment_floor.toString().trim() !== "" ) {
            if (isNaN(Number(req.body.apartment_floor))|| (req.body.apartment_floor < 0 || req.body.apartment_floor > 999 )) {
                return  res.status(400).send({message: "Bad Request: You have entered an apartment floor that's invalid!"})
            }
        }

 try {

    const hash = await bcrypt.hash(req.body.password,10)
    const params = {}
        params.username = req.body.username
        params.mail = req.body.mail 
        params.password = hash
        params.zip_code =  (req.body.zip_code === undefined || req.body.zip_code === ""  ) ? null : req.body.zip_code
        params.city = (req.body.city === undefined || req.body.city === "" ) ? null : req.body.city
        params.street = (req.body.street === undefined || req.body.street === "") ? null : req.body.street
        params.street_number = (req.body.street_number === undefined || req.body.street_number === "" ) ? null : req.body.street_number
        params.apartment_floor = (req.body.apartment_floor === undefined || req.body.apartment_floor === "" ) ? null : req.body.apartment_floor
       

        const query = `
        INSERT INTO Users  (username,  mail, password, zip_code, city, street, street_number, apartment_floor)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        ` 
        const qvals = [params.username, params.mail, params.password,params.zip_code, params.city, params.street,params.street_number,params.apartment_floor ]
    
         await pool.query(query, qvals);  
        return res.status(201).send({ message: "User created!"}) 
    } catch (err) {
// gestiamo err così con il code senza fare un'altra query al db per non anadre in una situation di race condition
        if (err.code === '23505') {
             if (err.detail.includes('username')){
              return res.status(409).send({message : "This username already exist. Pick another one!"})
            }
            if (err.detail.includes('mail')) {
              return res.status(409).send({message : "This mail is already been used. Pick another one!"})
            }
        }
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }

}

const login = async (req,res) => {
// #swagger.tags = ['Authentication']
// #swagger.summary = 'Sign in'
// #swagger.description = 'Endpoint to authenticate users. It expects the username along with the password in the body.'
if (!req.body) {
      return res.status(400).send({message: "Bad Request: No body provided"})
    } 
if (!req.body.username) {
      return res.status(400).send({message: "Bad Request: Username cannot be empty!"})
    } 
if (!req.body.password) {
      return res.status(400).send({message: "Bad Request: The password cannot be empty!"})
    } 
    try {
        const query = `
        SELECT password
        FROM users
        WHERE username = $1;
        `
        const qvals = [req.body.username.trim()]

        const results = await pool.query(query, qvals)

        if (results.rows.length == 0) {
            return res.status(401).send({message: "User does not exist!"})
        }    
        const results_user = results.rows[0];
        const passwordOK = await bcrypt.compare(req.body.password,results.rows[0].password)
        
        if (!passwordOK) {
            return res.status(401).send({message: "Incorrect password"})
        }
        const payload = {username : req.body.username.trim() }
        

        //prendimao una chiave sessione per poi prenderla come chiave di criptazione
        const session_id = await bcrypt.genSalt(10)
        const refresh_key = new TextEncoder().encode(session_id)
        const upQuery = `
        UPDATE users 
        SET session_id = $1 
        WHERE username = $2
        `
        const upVals = [session_id, req.body.username]
        await pool.query(upQuery,upVals)
        //crea un nuovo oggetto SignJWT e lo firma 
        const token = await new SignJWT(payload).setProtectedHeader({alg: 'HS256'}).setExpirationTime('10m').sign(jwt_key)

        const refresh_token = await new SignJWT(payload).setProtectedHeader({alg: 'HS256'}).sign(refresh_key)
        return res.send({token,refresh_token})
        
    } catch (err) {
            console.log(err)
            return res.status(500).send({message: "Query error"})
        }

}

const refresh = async (req, res) => {
// #swagger.tags = ['Authentication'] 
// #swagger.summary = 'Refresh session'
// #swagger.description = 'Generates a new access token to keep the user logged in without forcing them to type their password again.'

// se non c'è il body non mi stai mandando nulla o che non mi stai mandando il token di refresh
    if(!req.body || !req.body.refresh_token ) {
    return res.status(400).send({message: "Bad Request: No refresh token provided!"})
    } 
    try {
        const refreshPayload = decodeJwt(req.body.refresh_token)
        //se il token deocodificato è una stringa valida ma non ha le proprietà piazzamo un bell'errore
        if(!refreshPayload || !refreshPayload.username) {
           return res.status(401).send({message: "Unauthorized: Refresh token invalid!"}) 
        }
        const query = `
        SELECT session_id 
        FROM users 
        WHERE username=$1;
        `
        const qvals = [refreshPayload.username]
        const results = await pool.query(query,qvals)

        //se l'utente non è loggato
        if(results.rows.length == 0 || !results.rows[0].session_id) {
            return res.status(401).send({message: "Unauthorized: Refresh token invalid!"})
        }
        //funzione che confronta il refresh_token e va a verificare se ciò che l'ha criptato è la nostra password che abbiamo impostato sopra 
        //facciamo restituire il payload che sarebbe type e username dello user
       const {payload} = await jwtVerify(req.body.refresh_token, new TextEncoder().encode(results.rows[0].session_id)) 

         //prendimao una chiave sessione per poi prenderla come chiave di criptazione
        const session_id = await bcrypt.genSalt(10)
        const refresh_key = new TextEncoder().encode(session_id)
        const upQuery = `
        UPDATE users
         SET session_id = $1
          WHERE username = $2;
          `
        const upVals = [session_id, refreshPayload.username]
        await pool.query(upQuery,upVals)
        //crea un nuovo oggetto SignJWT e lo firma 
        const token = await new SignJWT(payload).setProtectedHeader({alg: 'HS256'}).setExpirationTime('10m').sign(jwt_key)

        const refresh_token = await new SignJWT(payload).setProtectedHeader({alg: 'HS256'}).sign(refresh_key)
        return res.send({token,refresh_token})

    } catch (err) {
        // afcciamo un bel controllo sui nomi degli errori >> succede se mettiamo un token che non è un refresh token o una stringa a caso spacciata per refresh token
        if (err.name === 'JWSSignatureVerificationFailed' || err.name === 'JWTExpired' || err.name === 'TypeError') {
            return res.status(401).send({message: "Unauthorized: Refresh token old or invalid!"})
        }
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }

}

const logout  = async (req, res) => {
// #swagger.tags = ['Authentication'] 
// #swagger.summary = 'User logout'
// #swagger.description = 'Logs the user out of the application and clears their active session.'

const query = `
UPDATE users
 SET session_id = NULL
WHERE  username = $1;
`
const qvals = [req.user]

try {
    await pool.query(query, qvals)
   return  res.status(200).send({message: "Logged out!"})
} catch (err) {
    console.log(err)
    return res.status(500).send({message: "Query error"})
}
}


//vendors
const getVendors = async (req, res) => {
// #swagger.tags = ['Vendors']
// #swagger.summary = 'Fetch public vendor collection'
// #swagger.description = 'Retrieves public profile data for all vendors. Supports pagination via query parameters.'

//controlli per page e size che siano corretti 
 //facciamo una sanificazione dei parametri 
  if (req.query.page !== undefined && req.query.page !== "" ) {
            if ((isNaN(req.query.page)) || (req.query.page < 0) ) {
                return  res.status(400).send({message: "Bad Request: You have entered a number for the page that's invalid !"})
            }
        }
   if (req.query.size !== undefined && req.query.size !== "" ) {
            if ((isNaN(req.query.size)) || (req.query.size < 0 || req.query.size > 50) ) {
                return  res.status(400).send({message: "Bad Request: You have entered a number for the size that's invalid!"})
            }
        }
    if (req.query.q !== undefined && req.query.q !== "" ) {
            if (req.query.q.toString().length > 20 ) {
                return  res.status(400).send({message: "Bad request: If filtering by username, it must be under 20 characters!"})
            }
        }
    const params = {}
        //se ciò che c'è tra parentesi non è vero allora parti dala pagina zero 
        params.page= req.query.page ? parseInt(req.query.page) : 0
        params.size = req.query.size ?  parseInt(req.query.size) : 20 
        params.q = req.query.q === undefined ? "" : req.query.q
        params.previous= params.page > 0 ? params.page -1 : null
        params.next = null 

    const query = `
      SELECT U.username
      FROM Users As U
      JOIN Vendors AS V ON V.username_vendor = U.username
      WHERE  U.username ILIKE $1
      ORDER BY U.username 
      LIMIT $2 OFFSET $3 ;
    `
    //OFFSET è quanti elementi devo saltare e LIMIT quanti ne devo mostare
    const qparams = [`%${params.q}%`, params.size+1, params.size*params.page]
    try {
       const results = await pool.query(query, qparams);

       if(results.rows.length > params.size) {
            params.next = params.page +1
             results.rows= results.rows.slice(0,-1)
        }

     params.results = results.rows;

        // generiamo i link ciclando su ogni prodotto della lista 
         for (const vendor of params.results) {

             const linkaggiuntivi = linkGeneratorVendors(vendor,req.user )
                vendor.links = linkaggiuntivi
            }  

     return res.status(200).send({
         message: "Users list retrieved successfully!" ,
         res : params.results
        })

    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }
}

const getVendorProfile = async (req,res) => {
// #swagger.tags = ['Vendors']
// #swagger.summary = 'Retrieve a specific vendor profile'
// #swagger.description = 'Public endpoint to fetch the public profile data of a specific vendor using the unique identifier (username).'
if (req.params.username.trim() === "" ) {
    return res.status(400).send({message : "Bad request: Username cannot be empty!"})
}

if (req.params.username !== undefined && req.params.username !== "" ) {
            if (req.params.username.toString().length > 20 ) {
                return  res.status(400).send({message: "Bad request: Username must be under 20 character!"})
            }
        }
    const params = {}
    params.username = req.params.username
    const qparams = [params.username]
    const query = `
     SELECT U.username,U.city
      FROM Users As U
      JOIN Vendors AS V ON V.username_vendor = U.username
      WHERE  U.username ILIKE $1
    `
    //OFFSET è quanti elementi devo saltare e LIMIT quanti ne devo mostare
    try {
       const results = await pool.query(query, qparams);
       if (results.rows.length != 1)
         return res.status(404).send({message: "Vendor not found!"})
        
        const vendor = results.rows[0]
       // aggiungiamo nel risultato anche il vendor_LNK che abbiamo calcolato con la nostra bella function
       const linkaggiuntivi = linkGeneratorVendors(vendor, req.user )
                vendor.links = linkaggiuntivi
    
       return res.status(200).send({
         message: "Vendor data retrieved successfully!" ,
         res : vendor
        }) 
    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }
}

const getVendorProfilePhoto = async(req,res) => {
 // #swagger.tags = ['Vendors']
// #swagger.summary = 'Retrive the photo profile of a specific vendor'
// #swagger.produces = ['image/jpeg']
// #swagger.description ='Authenticated endpoint to request the personal profile photo of a specific vendor using the unique identifier (username_vendor).' 
if (req.params.username.trim() === "" ) {
    return res.status(400).send({message : "Bad request: Username cannot be empty!"})
}

if (req.params.username !== undefined && req.params.username !== "" ) {
            if (req.params.username.toString().length > 20 ) {
                return  res.status(400).send({message: "Bad request: Username must be under 20 character!"})
            }
        }

    try {  
        const query = `
       SELECT U.username
       FROM Users As U
       JOIN Vendors AS V ON V.username_vendor = U.username
       WHERE  U.username = $1
        `
        //username del vendor
        const qparams = [req.params.username]
        const results= await pool.query(query, qparams)
        // piazziamo un bel controllo sennò prende anche le immagini dei non vendor ( quindi degli user come rebecca)
        if (results.rows.length != 1) {
        return res.status(404).send({message: "This vendor doesn't exist!"})
       }
       //se è un vendor cerchiamo la sua bella immagine che non viene ritornata se non esiste 
        const file_path = __dirname + "/profile_Picture/" + req.params.username + ".jpg" 
        //gestisci tutto con una callback per non far crashare il sistema se non trova una foto
        return res.sendFile(file_path, (err) => {
            if (err) {
                return res.status(404).send({ message: "Image Vendor not found!"})
            }
        })
        } catch (err) {
            return res.status(500).send({message: "Query error"})
        }


}

const getVendorProducts = async(req, res) => {
    //#swagger.tags = ['Vendors']
    // #swagger.summary = 'Get products by vendor username'
    // #swagger.description = 'Returns a paginated list of products offered by a specific vendor.'

// andiamo a richiedere la lista di tutti i products di un certo vendor 
//controlli per page e size che siano corretti 
 //facciamo una sanificazione dei parametri 
  if (req.query.page !== undefined && req.query.page !== "" ) {
            if ((isNaN(req.query.page)) || (req.query.page < 0) ) {
                return  res.status(400).send({message: "Bad Request: You have entered a number for the page that's invalid !"})
            }
        }
   if (req.query.size !== undefined && req.query.size !== "" ) {
            if ((isNaN(req.query.size)) || (req.query.size < 0 || req.query.size > 50) ) {
                return  res.status(400).send({message: "Bad Request: You have entered a number for the size that's invalid!"})
            }
        }
    if (req.params.username_vendor === undefined || req.params.username_vendor === "" ) {
            return res.status(400).send({ message: "Bad Request: The username_vendor parameter is required!"})
        }
    if (req.query.product_name !== undefined && req.query.product_name !== "") {
        if (req.query.product_name.toString().length > 50) {
            return res.status(400).send({ message: "Bad Request: Product name filter must be under 50 characters!" });
        }
    }
    const params = {}
        //se ciò che c'è tra parentesi non è vero allora parti dala pagina zero 
        params.page= req.query.page ? parseInt(req.query.page) : 0
        params.size = req.query.size ?  parseInt(req.query.size) : 20 
        params.username_vendor = req.params.username_vendor
        params.product_name = req.query.product_name === undefined ? "" : req.query.product_name;
        params.previous= params.page > 0 ? params.page -1 : null
        params.next = null 
try {
        // Verifichiamo prima che il vendor esista
        const vendorCheckQuery = `
            SELECT username_vendor
            FROM Vendors 
            WHERE username_vendor = $1;
        `;
        const vendorResult = await pool.query(vendorCheckQuery, [params.username_vendor]);

        if (vendorResult.rows.length === 0) {
            return res.status(400).send({ message: "Vendor not found!" });
        }
    const productsQuery = `
            SELECT *
            FROM Products
            WHERE username_vendor = $1 AND name ILIKE $2
            ORDER BY product_id ASC
            LIMIT $3 OFFSET $4;
        `;
        
        const results = await pool.query(productsQuery, [params.username_vendor,`%${params.product_name}%`, params.size+1, params.size*params.page]);
        if(results.rows.length > params.size) {
            params.next = params.page +1
             results.rows= results.rows.slice(0,-1)
        }
          params.results = results.rows;
        // generiamo i link ciclando su ogni prodotto della lista 
         for (const product of params.results) {

             const linkaggiuntivi = linkGeneratorProducts(product,null )
                product.links = linkaggiuntivi
            }  
        return res.status(200).send({
            message: "OK",
            results: params.results
        })
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: "Query error" });
    }
}

// profile 
const getMe = async(req,res) => { 
// #swagger.tags = ['Profile']
// #swagger.summary = 'Retrive current user profile'
// #swagger.description ='Authenticated endpoint to fetch the personal profile data of the currently logged-in user.'
const qparams = [req.user]
    const query= `
    SELECT U.username, U.mail, U.zip_code, U.city, U.street, U.street_number, U.apartment_floor, V.VAT_NUMBER
    FROM Users AS U
    LEFT JOIN Vendors AS V ON V.username_vendor = U.username
    WHERE U.username = $1;
    `
    try {
       const results = await pool.query(query, qparams);
        const me = results.rows[0]
       // Link personali che servono SEMPRE a chi sta guardando il proprio profilo
        const profileLinks = {
            "image_LNK": {
                "href": "/me/image",
                "method": "GET"
            },
            "patch_LNK": {
                "href": "/me",
                "method": "PATCH"
            }
        };

        if (me.vat_number) {
             // aggiungiamo nel risultato anche i vendor_LNK che abbiamo calcolato con la nostra bella function
            me.links = {
                ...profileLinks,
                ...linkGeneratorVendors(me, req.user)
            };
        } else {
            // Se è uno User normale, mettiamo solo i link personali e i suoi acquisti/seguiti
            me.links = {
                ...profileLinks,
                "purchases_LNK": {
                    "href": `/purchases/${me.username}`,
                    "method": "GET"
                },
                "followings_LNK": {
                    "href": `/followings/${me.username}`,
                    "method": "GET"
                }
            };
        }
         return res.status(200).send({
         message: "OK" ,
         userData : me
        }) 
    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }
}

const getMyPhoto = async( req,res) => {
 // #swagger.tags = ['Profile']
// #swagger.summary = 'Retrive the current user  photo'
// #swagger.produces = ['image/jpeg']
// #swagger.description ='Authenticated endpoint to request the personal profile photo of the currently logged-in user.' 
//dirname >guarda che sei in questa cartella 
    try {  
        const file_path = __dirname + "/profile_Picture/" + req.user + ".jpg" 
        //gestisci tutto con una callback per non far crashare il sistema se non trova una foto
        return res.sendFile(file_path, (err) => {
            if (err) {
                return res.status(404).send({ message: "Image not found!"})
            }
        })
        } catch (err) {
            return res.status(500).send({message: "Query error"})
        }
}

const postMyPhoto = async (req,res) => {
 // #swagger.tags = ['Profile']
// #swagger.summary = 'Upload current user profile picture'
// #swagger.description ='Authenticated endpoint to upload the profile image for the currently logged-in user. Expect an image file in jpg.'
/* #swagger.requestBody = {
            required: true,
            content: {
                "multipart/form-data": {
                    schema: {
                        type: "object",
                        properties: {
                            my_image: {
                                type: "string",
                                format: "binary"
                            }
                        }
                    }
                }
            }
         }
    */ 
   if( req.files == undefined || req.files.my_image  == undefined ) {
    return res.status(400).send({message : "Bad Request: No image receveid! "})
   }
   if (req.files.my_image.mimetype !== "image/jpeg" ) {
     return res.status(415).send({message: "Unsupported Media Type: Only JPG format is allowed!"})
   }
    const max_size_image = 100 * 1024; // Corrisponde a 102400 byte
    if (req.files.my_image.size > max_size_image) {
        return res.status(400).send({ message: "Bad Request: Image too large! Max 100KB allowed." });
    }
    //salviamo il magico path per il db 
    const path_db = "/profile_Picture/" + req.user + ".jpg"
    const path_uploaded = __dirname + path_db
try {
    // Sposto il file sul server usando la stringa del percorso
    await req.files.my_image.mv(path_uploaded);
    return res.status(201).send({message: "Photo profile uploaded!"});

} catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Query error" });
}
}

const patchMe = async (req,res) => {
 // #swagger.tags = ['Profile']
// #swagger.summary = 'Update current user profile data'
// #swagger.description ='Authenticated endpoint to modify the personal profile data of the currently logged-in user.' 

  if (req.body === undefined) {
      return res.status(400).send({message: "Bad Request: No body provided"})
    }  

    // controllo la street se c'è
    if (req.body.street !== undefined && req.body.street !== null && req.body.street.toString().trim() !== "" ) {
            if (req.body.street.toString().length > 25) {
                return  res.status(400).send({message: "Bad Request: You have entered a name of a street that's too long!"})
            }
        }
 // controllo la city  se c'è
    if (req.body.city !== undefined && req.body.city !== null &&req.body.city.toString().trim() !== "" ) {
            if (req.body.city.toString().length > 15) {
                return  res.status(400).send({message: "Bad Request: You have entered a name of a city that's too long!"})
            }
        }
 // controllo lo zip_code se c'è
    if (req.body.zip_code !== undefined && req.body.zip_code !== null && req.body.zip_code.toString().trim() !== ""){
            if (isNaN(Number(req.body.zip_code.toString().trim()))) {
                return  res.status(400).send({message: "Bad Request: You have entered a zip_code that's invalid!"})
            }
            if (req.body.zip_code.toString().trim().length !== 5) {
               return  res.status(400).send({message: "Bad Request: You have entered a zip_code that's invalid!"})
            }
        }
// controllo lo street number se c'è
    if (req.body.street_number !== undefined && req.body.street_number !== null && req.body.street_number.toString().trim() !== "" ) {
            if (isNaN(Number(req.body.street_number))|| (req.body.street_number < 0 || req.body.street_number > 999 )) {
                return  res.status(400).send({message: "Bad Request: You have entered a street number that's invalid!"})
            }
        }
// controllo apartament floor
    if (req.body.apartment_floor !== undefined && req.body.apartment_floor !== null && req.body.apartment_floor.toString().trim() !== "" ) {
            if (isNaN(Number(req.body.apartment_floor))|| (req.body.apartment_floor < 0 || req.body.apartment_floor > 999 )) {
                return  res.status(400).send({message: "Bad Request: You have entered an apartment floor that's invalid!"})
            }
        }
     if (req.body.VAT_NUMBER !== undefined &&  req.body.VAT_NUMBER !== null && req.body.VAT_NUMBER !== "" ) {
            if ((req.body.VAT_NUMBER.toString().length !==15)) {
                return  res.status(400).send({message: "Bad Request: VAT_NUMBER must be 15 character!"})
            }
        }

     try {
        let hashedPassword = null;
        if (req.body.password && req.body.password.trim() !== "") {
            hashedPassword = await bcrypt.hash(req.body.password, 10);
        }
        const  params = {}
        params.street = (req.body.street === undefined || req.body.street === "") ? null : req.body.street
        params.city = (req.body.city === undefined || req.body.city === "" ) ? null : req.body.city
        params.zip_code =  (req.body.zip_code === undefined || req.body.zip_code === ""  ) ? null : req.body.zip_code
        params.street_number = (req.body.street_number === undefined || req.body.street_number === "" ) ? null : req.body.street_number
        params.apartment_floor = (req.body.apartment_floor === undefined || req.body.apartment_floor === "" ) ? null : req.body.apartment_floor
        params.password = hashedPassword
        params.VAT_NUMBER = (req.body.VAT_NUMBER  === undefined || req.body.VAT_NUMBER === "" ) ? null : (req.body.VAT_NUMBER )

        const query = `
       UPDATE Users
        SET street = COALESCE($2, street),
        city = COALESCE($3, city),
        zip_code = COALESCE($4, zip_code),
        street_number = COALESCE($5, street_number),
        apartment_floor = COALESCE($6, apartment_floor),
        password = COALESCE($7, password)
        WHERE username = $1;
        ` 
        const qparams = [req.user, params.street,params.city, params.zip_code,params.street_number,params.apartment_floor,  params.password]
            await pool.query(query, qparams);  
        // se inserisce anche il VAT_NUMBER allora dobbaimo aggiornare la tabella vendors 
        if (req.body.vat_number) {
            const BecomeVendorQuery = `
                INSERT INTO Vendors (username_vendor, VAT_NUMBER)
                VALUES ($1, $2)
                ON CONFLICT (username_vendor) 
                DO UPDATE SET VAT_NUMBER = EXCLUDED.VAT_NUMBER;
            `;

            await pool.query(BecomeVendorQuery, [req.user, req.body.VAT_NUMBER]);
        }
        return res.status(200).send({ message: "User updated!" }) 
    } catch (err) {
    // gestiamo err  così con il code senza fare un'altra query al db per non anadre in una situation di race condition
        if (err.code === '23505') {
            if (err.detail.includes('vat_number')){
              return res.status(409).send({message : "This VAT_NUMBER already exist. Pick another one!"})   
            }
        }
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }

}
e

//my purchases

const getMyPurchases = async (req,res) => {
 // #swagger.tags = ['Purchases']
// #swagger.summary = 'Retrive current user profile purchases'
// #swagger.description ='Authenticated endpoint to retrive the personal purchase history of the currently logged-in user.' 

//controlli per page e size che siano corretti 
 //facciamo una sanificazione dei parametri 
  if (req.query.page !== undefined && req.query.page !== "" ) {
            if ((isNaN(req.query.page)) || (req.query.page < 0) ) {
                return  res.status(400).send({message: "You have entered a number for the page that's invalid !"})
            }
        }
      if (req.query.size !== undefined && req.query.size !== "" ) {
            if ((isNaN(req.query.size)) || (req.query.size < 0 || req.query.size > 50) ) {
                return  res.status(400).send({message: "You have entered a number for the size that's invalid!"})
            }
        }
          if (req.query.username_vendor !== undefined && req.query.username_vendor !== "" ) {
            if (req.query.username_vendor.toString().length > 20 ) {
                return  res.status(400).send({message: "You have entered a number for the username_vendor that's too long!"})
            }
        }

    const params = {}
        // se fa una ricerca per LIKE ma non viene passato nulla prendi tutto '%'
        params.product_name = req.query.product_name ? `%${req.query.product_name }%` : '%'
        params.timestamp_transaction = req.query.timestamp_transaction === undefined ? "" : req.query.timestamp_transaction
        params.page= req.query.page ? parseInt(req.query.page) : 0
        params.size = req.query.size ?  parseInt(req.query.size) : 20 
        params.previous= params.page > 0 ? params.page -1 : null
        params.next = null 


    const query = `
        SELECT Pu.*, Pr.name AS product_name
        FROM Purchases AS Pu
        JOIN Products AS Pr ON (Pr.product_id = Pu.product_id)
        WHERE Pu.username_buyer = $1 
        AND Pr.name ILIKE $2
        AND ($3 = '' OR CAST(Pu.timestamp_transaction AS date) = CAST($3 AS date))
        ORDER BY Pu.timestamp_transaction DESC
        LIMIT $4 OFFSET $5;
        `
    const qparams = [req.user, params.product_name, params.timestamp_transaction, params.size+1, params.size*params.page]
    try {
       const results = await pool.query(query, qparams)
       if(results.rows.length > params.size) {
            params.next = params.page +1
             results.rows= results.rows.slice(0,-1)
        }
         // abbimao tutte le rows dei risulati trovati 
        params.results = results.rows;

        // generiamo il link per ogni prodotto della lista 
        for (const product of params.results ) {
          product.links = {
         "href": `/products/${product.product_id}`,
         "method" : "GET"
         }
        }
     return res.status(200).send({
         message: "Users list retrieved successfully!" ,
         res :  params.results
        })

    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }


}

const postMyNewPurchase = async(req,res) => {
 // #swagger.tags = ['Purchases']
// #swagger.summary = 'Add a new order to the purchase history'
// #swagger.description ='Authenticated endpoint to register a new purchase for the current logged-in user.' 

//controlliamo un po' il product id che ci sia e che sia un numero
   if (!req.body || req.body.product_id === undefined || req.body.product_id === "") {
        return res.status(400).send({ message: "Bad Request: Product_id is required and cannot be empty!" });
    }
    if (isNaN(Number(req.body.product_id))){
        return res.status(400).send({ message: "Bad Request: Product_id must be a valid number!" });
    }
    const product_id_parsata = parseInt(req.body.product_id, 10);
    if (isNaN(product_id_parsata)) {
        return res.status(400).send({ message: "Bad Request: Product_id must be a valid number!" });
    }
    try {
    //estraiamo inanzitutto il vendor e il type del prodotto per fare un controllo se il buyer ha l'indirizzo >> sennò si becca errore
    const productquery = `
    SELECT username_vendor,type, quantity
    FROM Products 
    WHERE product_id = $1;
    `

    const results = await pool.query(productquery,[ product_id_parsata])
    if (results.rows.length === 0 ) {
    return res.status(400).send({message : "Bad Request: Product doesn't exist!"})
    }
    const username_vendor_extract = results.rows[0].username_vendor
    const product_type = results.rows[0].type
    const product_quantity = results.rows[0].quantity


    if (username_vendor_extract === req.user) {
        return res.status(400).send({message : "You cannot buy a product you sell!"})
    }
     //  bisogna sapere se questo user ha o meno un ADRESS che è valido >> sennò errore errorroso 
      if (product_type === 'physical') {
        const addressquery = `
        SELECT zip_code, city, street, street_number, apartment_floor
        FROM Users 
        WHERE username = $1;
        `
        const address_buyer = await pool.query(addressquery,[req.user])
        const address =address_buyer.rows[0]
        // facciamo finalmente questo check sull'inidirizzo che non deve essere null in nessun campo 
        if( !address || !address.zip_code || !address.city|| !address.street || !address.street_number ||!address.apartment_floor ) {
            return res.status(400).send({message: "Bad Request:You cannot place an order of a physical product without having a valid address!"})
        }
    }
    // se questo type è un type PHYSICAL >> dobbiamo fare un ulteriore controllo 
    // facciamo un'altra chiamata al db perchè dobbiamo sapere se ha una quantità>> va scalata
    // dobbiamo ricordarci che bisogna scalare di uno se la quantità è presente ma se non c'è non scaliamo nulla
      if (product_quantity !== null) {
        
        if (product_quantity <= 0) {
            return res.status(400).send({ message: "Bad Request: Product out of stock!" });
        }
        const quantity_update_query = `
        UPDATE Products 
        SET quantity = quantity - 1
         WHERE product_id = $1 AND quantity > 0;
         `
        // Se c'è un limite ed è > 0, scaliamo di 1
        await pool.query(quantity_update_query, [product_id_parsata])
        }
    //finally posso fare la query e aggiungere l'acquisto
    const query = `
    INSERT INTO Purchases  ( username_buyer,  product_id)
    VALUES  ($1,  $2);
    `
    const qparams= [ req.user, product_id_parsata]
     await pool.query(query, qparams)
     return res.status(201).send({ message: "Purchase added!"  }) 
    } catch(err) {
        return res.status(500).send({message: "Query error"})
    }

}

//follows 
// --> follower

const getMyFollowers = async(req,res) => {
 // #swagger.tags = ['Follows']
// #swagger.summary = 'Retrive current user followers '
// #swagger.description ='Authenticated endpoint to retrive the list of followers of the currently logged-in user.' 

    
//controlli per page e size che siano corretti 
 //facciamo una sanificazione dei parametri 
  if (req.query.page !== undefined && req.query.page !== "" ) {
            if ((isNaN(req.query.page)) || (req.query.page < 0) ) {
                return  res.status(400).send({message: "You have entered a number for the page that's invalid !"})
            }
        }
   if (req.query.size !== undefined && req.query.size !== "" ) {
            if ((isNaN(req.query.size)) || (req.query.size < 0 || req.query.size > 50) ) {
                return  res.status(400).send({message: "You have entered a number for the size that's invalid!"})
            }
        }
    
try {
const vendorCheckQuery = `
SELECT username_vendor 
 FROM Vendors 
WHERE username_vendor = $1;
`
const vendorResult = await pool.query(vendorCheckQuery, [req.user]);
  if (vendorResult.rows.length === 0) {
            return res.status(403).send({ message: "Forbidden: Only vendors can request their list of followers!" });
        }
 const params = {}
    params.following = req.user
    params.follower = req.query.follower ? `%${req.query.follower}%` : '%' // again riprendiamo tutti i follower se non viene specificato un determinato follower come parametro di query
    params.page= req.query.page ? parseInt(req.query.page) : 0
    params.size = req.query.size ?  parseInt(req.query.size) : 20 
    params.previous= params.page > 0 ? params.page -1 : null
    params.next = null 

    const query = `
    SELECT follower
    FROM Follows
    WHERE following=$1 AND follower ILIKE  $2 
    LIMIT $3 OFFSET $4;
    `
    const qparams = [params.following, params.follower,params.size+1, params.size*params.page ]
       const results = await pool.query(query, qparams)
       if(results.rows.length > params.size) {
            params.next = params.page +1
             results.rows= results.rows.slice(0,-1)
        }
         // abbiamo tutte le rows dei risulati trovati 
        params.results = results.rows;

     return res.status(200).send({
         message: "Follower list retrieved successfully!" ,
         res :  params.results
        })

    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }

}

// --> followings

const getMyFollowings = async(req,res) => {
 // #swagger.tags = ['Follows']
// #swagger.summary = 'Retrive current user followings '
// #swagger.description ='Authenticated endpoint to retrive the list of followings of the currently logged-in user.' 

 // no control tutti possono richiedere la propria lista di chi seguono e ovviamnete saranno tutti vendor >> si possono seguire loroo
    
//controlli per page e size che siano corretti 
 //facciamo una sanificazione dei parametri 
  if (req.query.page !== undefined && req.query.page !== "" ) {
            if ((isNaN(req.query.page)) || (req.query.page < 0) ) {
                return  res.status(400).send({message: "You have entered a number for the page that's invalid !"})
            }
        }
   if (req.query.size !== undefined && req.query.size !== "" ) {
            if ((isNaN(req.query.size)) || (req.query.size < 0 || req.query.size > 50) ) {
                return  res.status(400).send({message: "You have entered a number for the size that's invalid!"})
            }
        }
    const params = {}
    params.follower = req.user
    params.following = req.query.following ? `%${req.query.following}%` : '%' // again riprendiamo tutti i followingsse non viene specificato un determinato following come parametro di query
    params.page= req.query.page ? parseInt(req.query.page) : 0
    params.size = req.query.size ?  parseInt(req.query.size) : 20 
    params.previous= params.page > 0 ? params.page -1 : null
    params.next = null 

    const query = `
    SELECT following
    FROM Follows
    WHERE follower=$1 AND following ILIKE $2
    LIMIT $3 OFFSET $4;
    `
    const qparams = [params.follower, params.following,params.size+1, params.size*params.page ]
try {
       const results = await pool.query(query, qparams)
       if(results.rows.length > params.size) {
            params.next = params.page +1
             results.rows= results.rows.slice(0,-1)
        }
         // abbiamo tutte le rows dei risulati trovati 
        params.results = results.rows;
         // generiamo i link ciclando su ogni prodotto della lista 
         for (const vendor of params.results) {
             const linkaggiuntivi = linkGeneratorVendors({ username: vendor.following }, req.user)
                vendor.links = linkaggiuntivi
            } 

     return res.status(200).send({
         message: "Follower list retrieved successfully!" ,
         res :  params.results
        })

    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }

    





}

const postMyNewFollowings = async(req,res) => {
// #swagger.tags = ['Follows']
// #swagger.summary = 'Follow a new vendor'
// #swagger.description ='Authenticated endpoint allowing the currently logged-in user to follow a specific vendor by providing their username.'

if (!req.body || req.body.following === undefined || req.body.following === "") {
    return res.status(400).send({ message: "Bad Request: Following username is required!" });
}
try {
// cuciniamo di nuovo altri controlli (che sorpresa)
// andiamo a verificare che il vendor che si vuole inziare a seguire ESISTA come prima cosa 
 const userquery = `
 SELECT username_vendor
 FROM Vendors
 WHERE username_vendor = $1;
 `
 // non sia mai che l'utente mi metta degli spazi e non lo trova nel db
const userqvals = [req.body.following.toString().trim()]
const results_user = await pool.query(userquery, userqvals)
//check sullo username che se non esiste non va nel catch ma mi da questo errore 
if (results_user.rows.length === 0 ) {
    return res.status(400).send({message : "Bad Request: This vendor doesn't exist!"})
    }
const results_username= results_user.rows[0].username_vendor
//controlliamo che uno non sia crazy e voglia seguire se stesso (sia lui un vendor o meno)>> in ogni caso sopratutto se è un vendor anche perchè solo loro possono essere seguiti
if ( results_username === req.user) {
    return res.status(400).send({message : "Bad Request : You cannot follow yourself!"})
}
// ora che siamo tranquilli possiamo fare finalmente questa query
    const query = `
    INSERT INTO Follows(follower, following)
    VALUES ($1, $2);
    `
    const qvals= [req.user, req.body.following.toString().trim()]
     await pool.query(query, qvals)

    return res.status(201).send({message : "Vendor followed succesfully!"})
} catch (err) {
    if ( err.code === '23505') {
            if (err.detail.includes('following')){
              return res.status(409).send({message : "You already follow this vendor!"})   
            }
        }
    console.log(err)
    return res.status(500).send({message : "Query error"})
}

}

const deleteFollowing = async(req,res) => {
// #swagger.tags = ['Follows'] 
// #swagger.summary = 'Unfollow a vendor'
// #swagger.description = 'Authenticated endpoint for unfollowing a vendor that the current-user was following.'

try {
    const query = `
    DELETE  
    FROM Follows
    WHERE follower= $1 AND following = $2;
    `
console.log("ECCO COSA LEGGO:", req.params.following)
const qvals = [req.user, req.params.following.toString().trim()]
const results = await pool.query(query,qvals)
console.log(results)
// se non mi ritorna mulla nelle results.rowCount ci sono due casi: 1)  non esiste , 2) non lo stavi seguendo 
// sennò di solito rowcount è 1 
if (results.rowCount === 0 ) {
    return res.status(404).send({message : "Not Found: You cannot unfollow a vendor that you are not currently following!"})
    }
return res.status(204).send()
} catch (err) {
    console.log(err)
    return res.status(500).send({message: "Query error"})
}

}


//products
const getProducts = async (req, res) => {
// #swagger.tags = ['Products']
// #swagger.summary = 'Fetch products collection'
// #swagger.description = 'Public endpoint to retrieve the list of products. No authentication required. Supports pagination via query parameters.'

let TypeProduct
      if (req.query.type !== undefined && req.query.type !== "" && req.query.type !== null ) {
            if (req.query.type.trim().toLowerCase() !== 'digital' && req.query.type.trim().toLowerCase() !== 'physical'  ) {
                return res.status(400).send({message: "Bad Request: If filtering by type, the value must be 'physical' or 'digital'"})
            }
        } else {
            TypeProduct = ['physical', 'digital']
        }
  //controlli per page e size che siano corretti 
 //facciamo una sanificazione dei parametri 
  if (req.query.page !== undefined && req.query.page !== "" ) {
            if ((isNaN(req.query.page)) || (req.query.page < 0) ) {
                return  res.status(400).send({message: "Bad Request: You have entered a number for the page that's invalid !"})
            }
        }
      if (req.query.size !== undefined && req.query.size !== "" ) {
            if ((isNaN(req.query.size)) || (req.query.size < 0 || req.query.size > 50) ) {
                return  res.status(400).send({message: "Bad Request : You have entered a number for the size that's invalid!"})
            }
        }

        const params = {}
 
        params.type = TypeProduct
        params.name = req.query.name === undefined ? "" : req.query.name
        //se ciò che c'è tra parentesi non è vero allora parti dala pagina zero 
        params.page= req.query.page ? parseInt(req.query.page) : 0
        params.size = req.query.size ?  parseInt(req.query.size) : 20 
        params.previous= params.page > 0 ? params.page -1 : null
        params.next = null 

 const qparams = [params.type, `%${params.name}%`,params.size+1, params.size*params.page ]


    const query = `
    SELECT *
    FROM Products
    WHERE type= ANY($1) AND name ILIKE $2
    LIMIT $3 OFFSET $4 ;`


    try {
       const results = await pool.query(query, qparams);

       if(results.rows.length > params.size) {
            params.next = params.page +1
             results.rows= results.rows.slice(0,-1)
        }
        // abbimao tutte le rows dei risulati trovati 
        params.results = results.rows;

        // generiamo i link ciclando su ogni prodotto della lista 
         for (const product of params.results) {

             const linkaggiuntivi = linkGeneratorProducts(product, null )
                product.links = linkaggiuntivi
            }      

    return res.status(200).send({
         message: "OK!" ,
        productData : params.results
        }) 

    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }
}

const postNewProduct = async (req,res) => {
// #swagger.tags = ['Products']
// #swagger.summary = 'Create a new product'
// #swagger.description = 'Authenticated endpoint allowing vendors to publish a new product.'

    if(req.body === undefined) {
      return res.status(400).send({message: "Bad Request: No body provided"})
    }


    let productType 
    const hasByte = req.body.byte !== undefined && req.body.byte !== "" && req.body.byte !== null;
    const hasWeight = req.body.weight_in_kg !== undefined && req.body.weight_in_kg !== "" && req.body.weight_in_kg !== null;

    if (req.body.byte !==undefined && req.body.byte !== null ) {
       productType = 'digital' 
    } 
     if (req.body.weight_in_kg !==undefined && req.body.weight_in_kg !== null ) {
       productType = 'physical' 
    } 
    if (req.body.name === undefined || req.body.name.toString().trim() === "") {
        return res.status(400).send({message: "Bad Request: The name of the product cannot be empty!"})
    }
    if (req.body.name.toString().length > 50) {
        return res.status(400).send({message: "Bad Request: The name of the product must be a string of no more than 50 characters!"})
    }
     if (req.body.description === undefined || req.body.description.toString().trim() === "") {
        return res.status(400).send({message: "Bad Request: You need to add a description for the product!"})
    }
    if (req.body.description.toString().length > 200) {
        return res.status(400).send({message: "Bad Request: The description of the product must be a string of no more than 200 characters!"})
    }
     if (req.body.quantity !== undefined && req.body.quantity.toString().trim() !== "") {
         if (isNaN(req.body.quantity)) {
            return res.status(400).send({message: "Bad Request: If you add a quantity it must be a number!"})
         }
    }
    if (req.body.price === undefined || (req.body.price.toString().trim() === "")) {
        return res.status(400).send({message: "Bad Request: Price cannot be empty!"})
    }
     if (isNaN(Number(req.body.price)) ) {
        return res.status(400).send({message: "Bad Request: Price must be a valid number!"})
    }
     if (req.body.price < 0 ) {
        return res.status(400).send({message: "Bad Request: The price of the product cannot be a negative number!"})
    }
    if (!hasByte && !hasWeight) {
            return res.status(400).send({message: "Bad Request: You must provide either 'weight_in_kg' for physical products or 'byte' for digital products!"})
    }
  if (hasByte) {
    if (isNaN(Number(req.body.byte))) {
        return res.status(400).send({message: "Bad Request: 'byte' must be a valid number!"})
    }
    if (Number(req.body.byte) > 102400) {
        return res.status(400).send({message: "Bad Request: The file size of a digital product cannot exceed 100 KB"})
    }
}
    try {
    // dobbiamo checkare che sia un vendor 
    const vendorCheckQuery = `
    SELECT username_vendor
    FROM Vendors
    WHERE username_vendor = $1
    `
    const results= await pool.query(vendorCheckQuery,[req.user])
        // controlliamo l'esistenza dell'utente o che non abbia un image_url che è vuoto
        if (results.rows.length == 0 ) {
        return res.status(403).send({message: "Forbidden: Only vendors can add new products to the catalog!"})
        }

    const params = {}
    params.name = req.body.name
    params.description = req.body.description
    params.quantity = (req.body.quantity === undefined || req.body.quantity.toString().trim() === "") ? null : req.body.quantity
    params.price =  Number(Number(req.body.price.toFixed(2)))
    params.type = productType
    params.byte = hasByte ? Number(req.body.byte) : null
    params.weight_in_kg = hasWeight ? Number(req.body.weight_in_kg) : null
    params.usermname_vendor = req.user

    const qparams = [params.name, params.description, params.quantity, params.price, params.type, params.byte, params.weight_in_kg, req.user ]

    const query = `
    INSERT INTO Products(name,description, quantity, price, type, byte, weight_in_kg, username_vendor)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ) ;
    `
     await pool.query(query, qparams);  
    return res.status(201).send({ message: "Product created!"  }) 
    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }
}
const patchMyProduct = async(req,res) => {
// #swagger.tags = ['Products']
// #swagger.summary = 'Update product details'
// #swagger.description = 'Authenticated endpoint for vendors to update their product details. It expects the product_id and new data in the body.'

  if (req.body === undefined) {
      return res.status(400).send({message: "Bad Request: No body provided"})
    } 
     if (req.body.name === undefined || req.body.name.toString().trim() === "") {
        return res.status(400).send({message: "Bad Request: The name of the product cannot be empty!"})
    }
     if (isNaN(parseInt(req.params.product_id ))) {
         return res.status(400).send({message: "Bad Request: The product id is not a valid format!"})
    }
    if (req.body.name.toString().length > 50) {
        return res.status(400).send({message: "Bad Request: The name of the product must be a string of no more than 50 characters!"})
    }
     if (req.body.description === undefined || req.body.description.toString().trim() === "") {
        return res.status(400).send({message: "Bad Request: You need to add a description for the product!"})
    }
    if (req.body.description.toString().length > 200) {
        return res.status(400).send({message: "Bad Request: The description of the product must be a string of no more than 200 characters!"})
    }
     if (req.body.quantity !== undefined && req.body.quantity.toString().trim() !== "") {
         if (isNaN(req.body.quantity)) {
            return res.status(400).send({message: "Bad Request: If you add a quantity it must be a number!"})
         }
    }

    try {
         const checkQuery = `
            SELECT username_vendor
            FROM Products
            WHERE product_id = $1;
        `;
        const checkResult = await pool.query(checkQuery, [product_id]);

        // Se il prodotto non esiste proprio -> 404 Not Found
        if (checkResult.rows.length === 0) {
            return res.status(404).send({ message: "Not Found: Product does not exist!" });
        }

        // Se il prodotto esiste ma appartiene a un altro Vendor -> 403 Forbidden
        if (checkResult.rows[0].username_vendor !== req.user) {
            return res.status(403).send({ message: "Forbidden: You are not authorized to edit this product!" });
        }

        const updateQuery = `
            UPDATE Products
            SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            quantity = COALESCE($3, quantity)
            WHERE product_id = $4 AND username_vendor = $5
            RETURNING *;
        `;
    const params = {}
    params.username_vendor = req.user 
    params.product_id = req.params.product_id
    params.quantity = (req.body.quantity === undefined || req.body.quantity === "" || req.body.quantity === null ) ? null : parseInt(req.body.quantity)
    params.name = req.body.name
    params.description = req.body.description



    const qparams = [params.name, params.description, params.quantity, params.product_id, params.username_vendor]

     await pool.query(updateQuery, qparams); 
       return res.status(200).send({ message: "Product updated!"  }) 
    } catch (err) {
        if (err.code === '23505') {
        return res.status(409).send({ error: "Conflict: This name already exist!" });
    }
        console.log(err)
        return res.status(500).send({message: "Query error"})
    }

}

const getSingleProduct = async(req,res) => {
// #swagger.tags = ['Products']
// #swagger.summary = 'Retrieve a specific product'
// #swagger.description = 'Public endpoint to fetch detailed data of a single product using the product_id parameter.'
    if (isNaN(req.params.product_id) ) {
        return res.status(400).send({message: "Bad Request: Invalid 'product_id' format!"})
    }
    if (req.params.product_id === undefined || req.params.product_id === null || req.params.product_id.toString().trim() === "") {
        return res.status(400).send({message: "Bad Request: 'product_id' cannot be empty!"})
    }
    const params = {}
    params.product_id = parseInt(req.params.product_id, 10)
    const qparams = [params.product_id]
    const query = `
    SELECT *
    FROM Products
    WHERE product_id = $1 ;
    `
    try {
       const results = await pool.query(query, qparams);
       if (results.rows.length != 1) {
        return res.status(404).send({message: "Product not found!"})
       }
       const product = results.rows[0]
       // aggiungiamo nel risultato anche il vendor_LNK che abbiamo calcolato con la nostra bella function
       const linkaggiuntivi = linkGeneratorProducts(product, product.product_id )
                product.links = linkaggiuntivi
    
       return res.status(200).send({
         message: "Ok" ,
         productData : product
        }) 
    } catch (err) {
        console.log(err)
        return res.status(500).send({message: "Query error!"})
    }
}
const getSinglePhotoProduct = async( req,res) => {
 // #swagger.tags = ['Products']
// #swagger.summary = 'Retrive the current user  photo'
// #swagger.produces = ['image/jpeg']
// #swagger.description ='Authenticated endpoint to request the photos of a list of products.' 
//dirname >guarda che sei in questa cartella 

     if (req.params.product_id === undefined || req.params.product_id === null || req.params.product_id.toString().trim() === "") {
        return res.status(400).send({message: "Bad Request: 'product_id' cannot be empty!"})
    }

    if (isNaN(parseInt(req.params.product_id, 10))) {
        return res.status(400).send({message: "Bad Request: Invalid 'product_id' format!"})
    }

    try {  

        const query = `
        SELECT product_id
        FROM Products
        WHERE  product_id = $1;

        `
        const results= await pool.query(query, [req.params.product_id])
        // controlliamo l'esistenza dell'utente o che non abbia un image_url che è vuoto
        if (results.rows.length == 0 ) {
            return res.status(404).send({message: "This product doesn't exist!"})
        }
       // utilizziamo di nuovo la callback se non trova l'immagine: 
    const file_path = __dirname + "/product_Picture/" + req.params.product_id + ".jpg";
    return res.sendFile(file_path, (err) => {
        if (err) {
            return res.status(404).send({ message: "Image not found!" });
        }
});
    } catch (err) {
        return res.status(500).send({message: "Query error"})
    }
}

const postMyPhotoProduct = async (req,res) => {
 // #swagger.tags = ['Products']
// #swagger.summary = 'Upload a product picture'
// #swagger.description ='Authenticated endpoint to upload the product image for a speciofic product that is owns by the logged-in user. Expect an image file in jpg.'
/* #swagger.requestBody = {
            required: true,
            content: {
                "multipart/form-data": {
                    schema: {
                        type: "object",
                        properties: {
                            my_image: {
                                type: "string",
                                format: "binary"
                            }
                        }
                    }
                }
            }
         }
    */ 
  if (!req.params.product_id || req.params.product_id.toString().trim() === "" || isNaN(parseInt(req.params.product_id, 10))) {
        return res.status(400).send({message: "Bad Request: Invalid 'product_id' format!"})
   }
    if( req.files == undefined || req.files.my_image  == undefined ) {
    return res.status(400).send({message : "Bad Request: No image receveid! "})
   }
   if (req.files.my_image.mimetype !== "image/jpeg" ) {
     return res.status(415).send({message: "Unsupported Media Type: Only JPG format is allowed!"})
   }
   //facciamo un check che l'immagine non superi effettivamente i 100kb
    const max_size_image = 100 * 1024; 
    if (req.files.my_image.size > max_size_image) {
        return res.status(400).send({ message: "Bad Request: Image too large! Max 100KB allowed." });
    }
 
try {
       const query = `
        SELECT product_id
        FROM Products
        WHERE product_id = $1
    `
    const prodresults = await pool.query(query,[req.params.product_id])
    if (prodresults.rows.length == 0 ) {
            return res.status(404).send({message: "This products doesn't exist!"})
        }
    // path che vado a salvare nel db 
    const path_db =  "/product_Picture/" + req.params.product_id + ".jpg"
 
    const path_uploaded = __dirname + path_db
    // mv prende il file binario dell'immmagine per poi caricarla sul server utilizzando come posizione il path 
    await req.files.my_image.mv(path_uploaded);
    return res.status(201).send({message: "Photo profile uploaded!"});

} catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Query error" });
}
}






 