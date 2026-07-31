Nome, Cognome: Rebecca Fulginiti 

Matricola : 26182A

### **SCELTE PROGETTUALI**   


## **VINCOLI AGGIUNTIVI** 
>> un vendor non può recensire un prorpio prodotto perchè non lo può comprare ( se un vendor cerca di comprare un prodotto che vende lui viene bloccato). 

## **REGOLE DI DERIVAZIONE/FLUSSO** 


**RIDONDANZE**


**ELIMINAZIONE DELLE GENERALIZZAZIONI**

  
**ELIMINAZIONE ATTRIBUTI COMPOSTI E MULTIVALORE** 

  
**SCELTE DEGLI IDENTIFICATORI PRINCIPALI** 


## Progettazione logica (Modello Relazionale)
Legenda: __chiave primaria__, *chiave esterna*, **attributi unici**, --permette null--

* Users(__username__, **mail**, password, --zip_code--, --city--, --street--, --street_number--, --apartment_floor--, --image_url--, --session_id--)
* Vendors(__*username_vendor*__, **VAT_NUMBER**)
» * foreign key (username_vendor) references Users (username)
* Products(__product_id__, timestamp_put_on_sale, name, --quantity--, price, description, type, *username_vendor*, --byte--, --weight_in_kg--)
 » * foreign key (username_vendor) references Vendors(username_vendor)
* Reviews( __review_id__, *username_vendor*, *product_id*, rating, --comment--)
» * foreign key (username_vendor) references Vendors (username_vendor)
» * foreign key (product_id) references Products (product_id)
* Purchases(__purchase_id__ ,*username_buyer*, *product_id*, timestamp_transaction)
  » * foreign key (username_buyer) references Users (username)
  » * foreign key (product_id) references Products (product_id)
* Follows(__*follower*__, __*following*__)
  » * foreign key (follower) references Users (username)
  » * foreign key (following) references Vendors (username_vendor)

## CREATE TABLE
``` json
CREATE TABLE Users (
    username VARCHAR(20) PRIMARY KEY,
    mail VARCHAR(40) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    zip_code CHAR(5),
    city VARCHAR(15),
    street VARCHAR(25),
    street_number NUMERIC(3,0),
    apartment_floor NUMERIC(3,0), 
    session_id CHAR(29)
);
CREATE TABLE Vendors (
    username_vendor VARCHAR(20) PRIMARY KEY,
    VAT_NUMBER VARCHAR(15) NOT NULL UNIQUE,
    FOREIGN KEY (username_vendor) REFERENCES Users(username) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);
CREATE TABLE Reviews (
   review_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    username_buyer VARCHAR(20) NOT NULL,
    username_vendor VARCHAR(20) NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5 ),
    comment VARCHAR(100),

	FOREIGN KEY (username_buyer) REFERENCES Users(username),
    FOREIGN KEY (username_vendor) REFERENCES Vendors(username_vendor),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) 
        

);

CREATE TABLE Products (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    timestamp_put_on_sale TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(50) NOT NULL,
    quantity INT, 
    price DECIMAL(10,2) NOT NULL CHECK (price>=0), 
    description VARCHAR(200) NOT NULL,
    username_vendor VARCHAR(20) NOT NULL, 
    type VARCHAR(10) NOT NULL CHECK (type IN ('digital', 'physical')),
    byte BIGINT, -- Popolato solo se digitale
    weight_in_kg DECIMAL(5,2) -- Popolato solo se fisico
);
CREATE TABLE Purchases (
    purchase_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY ,
    timestamp_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	 username_buyer VARCHAR(20) NOT NULL, 
    product_id INT NOT NULL,
    
	FOREIGN KEY (username_buyer) REFERENCES Users(username),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) 
        ON DELETE RESTRICT      
);
CREATE TABLE Follows (
    follower VARCHAR(20) NOT NULL, -- username chi segue  
    following VARCHAR(20) NOT NULL, -- username chi viene seguito
    
    PRIMARY KEY (follower, following),
    
    FOREIGN KEY (follower) REFERENCES Users(username), 
    FOREIGN KEY (following) REFERENCES Vendors(username_vendor) 
);

```
## population table
INSERT INTO Reviews (username_buyer, username_vendor,product_id, rating, comment)
VALUES
('rebecca', 'dragan', 1, 4, null),
('rebecca', 'giorgia', 11, 5, 'Best album ever!!!'),
('rebecca', 'wiktor', 7, 4, 'Best mouse'),
('dragan', 'bettinz', 10, 5, 'Best album ever!!!'),
('filippo', 'wiktor', 7, 4, null)

## NUOVE API REST E QUERY SQL 

GET /reviews

GET-> Attraverso la GET andiamo a recuperare lòa lista paginata di tutte le recensioni che ho fatto. Viene estratto dla token l'identità dello user che quindi non deve inserrila. Per filtrare i risultati si può ricercarcare opzionalmente inserendo il rating che va da 1 a 5.

 Headers: 
    `Authorization:  Bearer <token>`

    `GET /reviews`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `rating`(opzionale)
        
    - Risposta:
        
	```json
        {
          "size": 20,
          "page": 0,
          "q": "r",
          "next": "/reviews?rating=3&size=20&page=1",
          "prev": null,
          "res": [
            {"review_id": 1, "username_buyer": 'rebecca', "username_vendor": dragan,, "product_id" : 1,"rating": 3, "comment": "i love this action figure!"},
            {"review_id": 11, "username_vendor": giorgia,, "product_id" : 1,"rating": 3, "comment": "I love this album!"},
          ]
	        }
	```
        
    - CODE: 
	    - **200 OK**: La richiesta è andata a buon fine e viene restituita la lista paginata delle reviews di chi fa la richiesta.
	    - **400 Bad Request**: I parametri di paginazione `size` o `page` risultano essere numeri negativi o non validi.
	    - **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
	    - **500 Internal Server Error**: Errore di query o business logic.
  -QUERY:
  SELECT *
  FROM Reviews
  WHERE username_buyer = $1 
  AND rating = COASCELE($2, rating)
  LIMIT $3 OFFSET $4; 
  - $1 : username del buyer che non  viene messo hardcoded dallo user ma estratto tramite il token di autenticazione 
  - $2: rating che il buyer ha messo ai prodotti per poter filtarre i risultati
  - $3: `size` indica quanti risultati mostrare .
  - $4 :`page` indica da quale riga partire .


POST  /reviews
Headers: 
    `Authorization:  Bearer <token>`
   
    `POST /reviews`
    
    - Richiesta: `product_id`, 'rating', 'comment' 
    - CODE: 
	    -  **200 OK**: Review aggiunta con successo 
	    -  **400 Bad Request**:  I dati inviati nel corpo della richiesta sono errati o incompleti .
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.     
        - **409 Conflict** : Lo user ha già recensito il prodotto se vuole modificare il suo rating può afre una patch.
        - **500 Internal Server Error**: Errore di query o di business logic.

    - QUERY:
      SELECT Pu.product_id, P.username_vendor
      FROM Purchases  AS Pu  
      LEFT JOIN Products AS P
      ON (Pu.product_id = P.product_id)
      WHERE Pu.product_id = $1 AND P.username_buyer=$2;
    >> $1>> product id 
    >> $2 >> username del buyer 
    --> questa query viene fatta per verificare se esiste tra  i miei  acquisti un prodotto caratterizzato da un certo product_id ( quindi capiamo s el'ho comprato) e estraimoa anch eil vendor eprchè non vogliamo farlo inserire dallo user.

   INSERT INTO Reviews ( username_buyer, username_vendor, product_id, rating, comment )
    VALUES ($1, $2, $3, $4, $5);
$1: username buyer > utente loggato 
$2 : username del vendor 
$3 :  product_id del prodotto che si vuole recensire
$4 : rating del prodotto 
$5: commento opzioanle sul prodotto 

 PATCH /reviews/review_id

patch >> modifico una reviews di un prodotto 

Headers: 
    `Authorization:  Bearer <token>`

`PATCH /reviews/review_id`
- Request body (review_id, rating, comment)

- CODE :
	- **200 OK**: La richiesta è andata a buon fine. Viene aggiornato il commento.
	- **400 Bad Request**: I dati inviati nel corpo della richiesta sono errati o incompleti.
	- **401 Unauthorized**:  Token non valido.
	- **500 Internal Server Error**: Errore di query o business logic.

-QUERY:
     UPDATE Reviews
        SET rating = $2,
        comment = COALESCE($3, comment)
        WHERE review_id = $1;
    - $1 : rewiew_id che si vuole aggiornare
    -$2 :  `rating`  aggiornato del prodotto 
    - $3 : `comment` riguardo al prodotto 



DELETE /reviews/reviews_id

Headers: 
    `Authorization:  Bearer <token>`
    
	 `DELETE /reviews/:review_id`
    
    - Parametri: `review_id`
    - CODE: 
	    - **204  OK**: rating del prodotto eliminata con successo
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.     
        - **404 Not Found**  : Non esiste una review con questo id.
        - **500 Internal Server Error**: Errore di query o di business logic.

    - QUERY:
      DELETE  
      FROM Reviews
      WHERE review_id = $2 ;

      - $1 : username dello `user`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
      - $2 : username del `vendor` che si vuole smettere di  seguire. 
