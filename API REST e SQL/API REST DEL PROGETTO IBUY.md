Nome, Cognome: Rebecca Fulginiti 
Matricola : 26182A

### **API REST E QUERY DEL PROGETTO IBUY**  

#  SESSIONI 
# /sessions

## POST 

- **POST** → Attraverso la POST si permette allo user, immettendo le sue credenziali (username, password), di effettuare il login. Se i dati sono corretti, il server genera e restituisce un token di autenticazione.
    
    `POST /sessions`
    
    - Request body: 
    ```json
    {
    "username": "string" ,
    "password": "string"
    }
    ```
    - CODE:
        - **200 OK**: La richiesta è andata a buon fine. Viene generato un token di autenticazione.
        - **400 Bad Request**: I dati inviati nel corpo della richiesta sono errati o incompleti.
        - **401 Unauthorized**:  Le credenziali inserite sono errate.
	      - **500 Internal Server Error**: Errore di query o business logic.

    - QUERY: 
      SELECT password
      FROM users
      WHERE username = $1;
      - $1 :  `username` dell’utente da ricercare nel database per verificarne le credenziali . 

      UPDATE users
      SET session_id = $1
      WHERE username = $2; 
      - $1 :  `session_id` generato dal server.
      - $2 : `username` trovato dalla SELECT .

# /sessions
## PATCH

- **PATCH** → Attraverso la PATCH si permette allo user di poter rigenerare il token di sessione.  Viene inserito il refresh token che è stato fornito durante il login.  Lo username dello user, che viene ricercato nel database, viene estratto dal payload del token.

`PATCH /sessions`
- Request body:
 ```json
    {
    "refresh_token": "string" 
    }
 ```
- CODE :
	- **200 OK**: La richiesta è andata a buon fine. Vengono generati un  nuovo token di autenticazione e un nuovo refresh token.
	- **400 Bad Request**: I dati inviati nel corpo della richiesta sono errati o incompleti.
	- **401 Unauthorized**:  Token non valido.
	- **500 Internal Server Error**: Errore di query o business logic.

- QUERY: 
    SELECT session_id
    FROM users
    WHERE username=$1;
    $1 :  `username` dello user da ricercare nel database . 
    
    UPDATE users
    SET session_id = $1
    WHERE username = $2;
    - $1 :  `session_id`  nuovo rigenerato dal server.
    - $2 : `username` trovato dalla SELECT .


# /logout
## DELETE

- **DELETE** → Attraverso la DELETE si permette allo user, autenticato, di poter effettuare il logout. 

Headers: 
    `Authorization:  Bearer <token>`
    
    `DELETE /sessions`
   - CODE : 
	   -  **200 OK**: La richiesta è andata a buon fine e l'utente viene scollegato correttamente.
	   - **401 Unauthorized**:  Token non valido o malformato.
	   - **500 Internal Server Error**: Errore di query o business logic.
    
  - QUERY: 
    UPDATE Users 
    SET session_id = NULL 
    WHERE username = $1;
    $1 :  `username` dell’utente da ricercare nel database per impostare  il session_id a NULL.  
      
---
# COLLEZIONE USER

Consideriamo la collezione degli USER:
#  **/users**  

## POST (registrazione nuovo user)

- **POST** → Attraverso la POST si permette la creazione di un nuovo account. Nella fase di registrazione l'utente sarà registrato esclusivamente come utente standard. Successivamente, tramite una richiesta PATCH in cui inserisce il VAT_NUMBER, potrà diventare un Vendor. Il sistema controlla che lo username e la mail inseriti non siano già presenti nel database, in tal caso gli viene ritornato un errore.
    
    `POST /users`
    
    -  Request body: `username`, `mail`, `password`, `zip_code` (opzionale), `city` (opzionale), `street` (opzionale), `street_number` (opzionale), `apartment_floor` (opzionale)
    - CODE:
        - **201 Created**: La richiesta è andata a buon fine. Il nuovo user viene creato e aggiunto nel database.
        - **400 Bad Request**: I dati inviati nel corpo della richiesta sono errati, incompleti o la mail non ha un formato valido.
        - **409 Conflict**: Lo username o la mail inseriti sono già associati a uno user esistente .
	    - **500 Internal Server Error**: Errore di query o business logic.

    - QUERY:  
      INSERT INTO Users  (username,  mail, password, zip_code, city, street, street_number, apartment_floor)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

      - $1:  `username` dell’utente da registrare. 
      - $2: `mail` dell’utente da registrare .
      - $3: `password` dell’utente da registrare ( successivamente ne viene fatto l’hash per non salvare la password in chiaro nel DB).
      - $4: `zip_code` che può essere null.
      - $5: `city` che può essere null.
      - $6:  `street`  che può essere null.
      - $7:  `street_number`  che può essere null.
      - $8: `apartment_floor`  che può essere null.
       

#  **/vendors**

## GET

- **GET** → Attraverso la GET si permette a uno user autenticato di ottenere una risposta, paginata, con la lista dei profili dei `vendor` presenti nella collezione. È inoltre possibile filtrare i risultati facendo una ricerca per username tramite i parametri di query (q). Per motivi di privacy si è scelto di far restituire solo i dati pubblici essenziali :
	-  Lo username del vendor
	- Il link ipertestuale per recuperare la foto profilo del vendor  tramite i link HATEOAS.
	- La lista dei prodotti messi in vendita da quel venditore tramite i link HATEOAS .
	- **Il link diretto al profilo completo** del vendor, sempre usando i link HATEOAS.
    
    Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /vendors`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `q`
        
    - Risposta:

```json
{
  "size": 20,
  "page": 0,
  "q": "fil",
  "next": "/vendors?q=fil&size=20&page=1",
  "prev": null,
  "res": [
	{
    "username": "filippo",
    "links": {
      "image_LNK": {
        "href": "/vendors/filippo/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/vendors/filippo/products",
        "method": "GET"
      },
      "vendor_LNK": {
        "href": "/vendors/filippo",
        "method": "GET"
      }
    }
  },
	{
    "username": "filomena",
    "links": {
      "image_LNK": {
        "href": "/vendors/filomena/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/vendors/filomena/products",
        "method": "GET"
      },
      "vendor_LNK": {
        "href": "/vendors/filomena",
        "method": "GET"
      }
    }
  },
    ...
  ]
 }
```
        
    - CODE:
	    - **200 OK**: La richiesta è andata a buon fine e viene restituita la lista paginata dei vendor che si è ricercata (anche se la lista è vuota).
        - **400 Bad Request**: I parametri di paginazione `size` o `page` risultano essere numeri negativi o non validi.
        - **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
        - **500 Internal Server Error**: errore di query o business logic
    
    - QUERY : 
      SELECT U.username,U.city
      FROM Users As U
      JOIN Vendors AS V ON V.username_vendor = U.username
      WHERE  U.username ILIKE $1
      ORDER BY U.username 
      LIMIT $2 OFFSET $3 ;

      - $1 :  `username` ricercato. Trova tutti i risultati che contengono la stringa inserita.
      - $2: `size` indica quanti risultati mostrare .
      - $3 :`page` indica da quale riga partire .
      --> ASC se si vuole un ordine ascendente o DESC per discendente .


---

# SINGOLO  USER

Consideriamo il singolo elemento USER :
Bisogna notare che viene fatta una netta distinzione sui dati che vengono restituiti rispetto a chi li richiede. Nello specifico evidenziamo due casi:

1. **Endpoint Dati Pubblici** : Sull'endpoint `/vendors/:username`  si possono richiedere tutti i dati  pubblici dei vendor. Questo comporta che i dati sensibili non vengano restituiti ma i dettagli del vendor che verrano forniti in risposta saranno  i seguenti: 
	1. Lo username,
	2. La città di residenza,
	3. Il link ipertestuale per recuperare la foto profilo del vendor  tramite i link HATEOAS.
	4. La lista dei prodotti messi in vendita tramite i link HATEOAS relativi alle risorse collegate. 
2.  **Endpoint Dati Privati** : Sull'endpoint `/me` si possono richiedere tutti i dati personali dello user che effettua la richiesta esclusa la password. Prima di ritornare la risposta il server estrae l'identità dello user direttamente dal token.
#  **/vendors/:username**

## GET

- **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere i dati di uno specifico vendor tramite il suo username. Per garantire la riservatezza e per mantenere la privacy il sistema non ritorna tutti dati,  ma, rispetto al GET sulla collezione,  viene restituito in più solo la città del vendor.  Se un vendor ricerca se stesso su questo endpoint vengono ritornati altri link HATEOAS come :
	- patch per fare modifiche la proprio profilo
	- purchase_LNK
	- followers_LNK
	- followings_LNK
    
    Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /users/vendors/:username`
    
    - Parametri (GET):  `username` 
        
    - Risposta:
    
    ```json
{
  "res": {
    "username": "bettinz",
    "city": "Milano",
    "links": {
      "image_LNK": {
        "href": "/vendors/bettinz/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/vendors/bettinz/products",
        "method": "GET"
      },
      "vendor_LNK": {
        "href": "/vendors/bettinz",
        "method": "GET"
      }
    }
  }
}
    ```
    
    - CODE: 
	    - **200 OK**: La richiesta è andata a buon fine e vengono restituiti i dati pubblici del vendor.
        - **400 Bad Request**: Lo username  inserito  non risulta avere un formato valido.
        - **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
        - **404 Not Found** : Lo username  inserito risulta avere un formato valido ma nessuna corrispondenza nel sistema.
        - **500 Internal Server Error**: errore di query o business logic.
    
    - QUERY: 
      SELECT U.username,U.city
      FROM Users As U
      JOIN Vendors AS V ON V.username_vendor = U.username
      WHERE  U.username ILIKE $1
    - $1 :  lo username del vendor che si vuole ricercare.


---

# IMMAGINE PROFILO SINGOLO VENDOR 
# /vendors/:username/image

## GET 

- **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere l'immagine profilo, se presente, di un certo vendor. 
Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /users/vendors/:username/image`
    
-  Parametri (GET):  `username` 
-  Risposta: viene restituita immagine, in formato jpeg, del profilo (se presente)
- CODE: 
	-  **200 OK**: La richiesta è andata a buon fine e  viene restituita immagine del vendor.
	- **400 Bad Request**: Lo username  inserito  non risulta avere un formato valido.
	- **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
	- **404 Not Found** : Lo username del vendor esiste ma non risulta avere associata nessuna immagine di profilo.
	- **500 Internal Server Error**: errore di query o business logic.

- QUERY:
   SELECT U.username
   FROM Users As U
   JOIN Vendors AS V ON V.username_vendor = U.username
    WHERE  U.username = $1

    - $1 : username del vendor che si vuole ricercare.



# /vendors/username_vendor/products
## GET
- **GET** → Attraverso la GET si permette a uno user autenticato di ottenere una risposta, paginata, con la lista dei prodotti di uno specifico `vendor`. È inoltre possibile filtrare i risultati facendo una ricerca per name del product tramite i parametri opzionali di query (product_name). 

    Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /vendors`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `username_vendor`, `product_name`(opzionale)
        
    - Risposta:
```json
{
  "message": "OK",
  "results": [
    {
      "product_id": 1,
      "name": "Spider-Man No Way Home AF",
      "quantity": 2,
      "price": 129.99,
      "description": "Action figure da collezione in scala 1:6 di Peter Parker. Dettagli ultra realistici in tessuto.",
      "username_vendor": "dragan",
      "type": "physical",
      "byte": null,
      "weight_in_kg": 1.20,
      "links": {
        "image_LNK": {
          "href": "/products/1/image",
          "method": "GET"
        },
        "vendor_LNK": {
          "href": "/users/vendors/dragan",
          "method": "GET"
        },
        "list_products_LNK": {
          "href": "/users/vendors/dragan/products",
          "method": "GET"
        },
        "product_LNK": {
          "href": "/products/1",
          "method": "GET"
        }
      }
    },
    {
      "product_id": 2,
      "name": "Mjolnir in Acciaio",
      "quantity": 3,
      "price": 249.99,
      "description": "Replica 1:1 del martello di Thor. Nota: pesa quasi 4kg, assicurati di essere degno prima dell'acquisto.",
      "username_vendor": "dragan",
      "type": "physical",
      "byte": null,
      "weight_in_kg": 3.80,
      "links": {
        "image_LNK": {
          "href": "/products/2/image",
          "method": "GET"
        },
        "vendor_LNK": {
          "href": "/users/vendors/dragan",
          "method": "GET"
        },
        "list_products_LNK": {
          "href": "/users/vendors/dragan/products",
          "method": "GET"
        },
        "product_LNK": {
          "href": "/products/2",
          "method": "GET"
        }
      }
    }
  ]
}

```
  -CODE:
	    - **200 OK**: La richiesta è andata a buon fine e viene restituita la lista paginata dei products di un certo vendor(anche se la lista è vuota).
        - **400 Bad Request**: I parametri di paginazione `size` o `page` risultano essere numeri negativi o non validi.
        - **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
        - **500 Internal Server Error**: errore di query o business logic

  -QUERY:
    SELECT username_vendor
    FROM Vendors 
     WHERE username_vendor = $1;
    - - $1 : `username_vendor`  del venditore.  

  SELECT *
  FROM Products
  WHERE username_vendor = $1 AND name ILIKE $2
  ORDER BY product_id ASC
  LIMIT $3 OFFSET $4;
  - $1 : `username_vendor`  del venditore.  
  - $2 : `name` del product 
  - $3: `size` indica quanti risultati mostrare .
  - $4 :`page` indica da quale riga partire .
---

# PROFILE 
# /me

## GET

- **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere **solo** i propri dati personali . Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'intero profilo privato (esclusa la password) più i vari link ipertestuali. Se l'utente autenticato è uno user normale (e non un vendor), il link `followers_LNK` non verrà restituito.
    
    Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /users/me`
    
    - Parametri (GET):   nessuno ( l'identità viene estratta dal token)
        
    - Risposta:

	```json
  {
  "message": "OK",
  "userData": {
    "username": "dragan",
    "mail": "dragan.v@mail.com",
    "zip_code": "10121",
    "city": "Torino",
    "street": "Garibaldi",
    "street_number": "5",
    "apartment_floor": null,
    "vat_number": "IT0098765432109",
    "links": {
      "image_LNK": {
        "href": "/me/image",
        "method": "GET"
      },
      "patch_LNK": {
        "href": "/me",
        "method": "PATCH"
      },
      "list_products_LNK": {
        "href": "/vendors/dragan/products",
        "method": "GET"
      },
      "purchases_LNK": {
        "href": "/purchases/dragan",
        "method": "GET"
      },
      "followers_LNK": {
        "href": "/followers/dragan",
        "method": "GET"
      },
      "followings_LNK": {
        "href": "/followings/dragan",
        "method": "GET"
      }
    }
  }
}
    ```
    
    - CODE: 
	    - **200 OK**: La richiesta è andata a buon fine e vengono restituiti i dati privati dello user che fa la richiesta.
        - **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
        - **500 Internal Server Error**: Errore di query o business logic.

    -QUERY: 
    SELECT U.username, U.mail, U.zip_code, U.city, U.street, U.street_number, U.apartment_floor, V.VAT_NUMBER
      FROM Users AS U
      LEFT JOIN Vendors AS V ON V.username_vendor = U.username
      WHERE U.username = $1;

      - $1 :  `username`  del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.

## PATCH 

- **PATCH** → Attraverso la PATCH si permette ad uno user autenticato di poter modificare solo alcuni dati (`street`, `city`, `zip_code`, `street_number`, `apartment_floor`, `VAT_number`, `password`). 

 Headers: 
`Authorization:  Bearer <token>`
	
 `PATCH /users/me`
	     
- **Request body:** `street`, `city`, `zip_code`, `street_number`, `apartment_floor`, `VAT_number`, `password`
    
- **Risposta:** Rappresentazione dello user modificato.
    
- **CODE:**
    
    - **200 OK**: Se la richiesta di modifica va a buon fine.
    - **400 Bad Request**: Se vengono passati parametri non permessi o malformati.
    - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.
    - **409 Conflict** : Se il VAT_NUMBER inserito risulta essere associato ad un altro vendor.
    - **500 Internal Server Error**: Errore di query o business logic.

- QUERY :

UPDATE Users
 SET street = COALESCE($2, street),
 city = COALESCE($3, city),
 zip_code = COALESCE($4, zip_code),
street_number = COALESCE($5, street_number),
apartment_floor = COALESCE($6, apartment_floor),
password = COALESCE($7, password)
WHERE username = $1;

-  $1:  `username ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2, $3, $4, $5, $6, $7 : I nuovi valori inviati nel Body (se non inviati, manterranno il valore corrente).


 INSERT INTO Vendors (username_vendor, VAT_NUMBER)
  VALUES ($1, $2)
  ON CONFLICT (username_vendor) 
  DO UPDATE SET VAT_NUMBER = EXCLUDED.VAT_NUMBER;
-  $1:  `username ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2 `VAT_NUMBER` 
--> Nota Bene: Se lo user aggiunge un VAT_NUMBER valido  viene eseguita questa altra query solo per inserire questo valore nella tabella Vendors. 

---
# IMMAGINI  SINGOLO USER

#  /me/image

## GET

 - **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere **solo** la propria immagine di profilo. Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'immagine profilo 
    
Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /me`
    
-  Parametri (GET):   nessuno ( l'identità viene estratta dal token)
        
    - Risposta:  foto in jpeg (se presente)

- CODE : 
	-  **200 OK**: La richiesta è andata a buon fine e  viene restituita immagine del profilo personale.
	- **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
	- **404 Not Found** : La richiesta risulta valida, ma la risorsa non è disponibile poiché l'utente non ha impostato alcuna immagine del profilo.
	- **500 Internal Server Error**: errore di query o business logic.


- QUERY: 
   SELECT username
    FROM Users
    WHERE  username = $1
  -  $1:  `username ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.



## POST 

-  **POST** → Attraverso la POST si permette ad uno user, autenticato, di poter impostare una nuova immagine per il proprio profilo. 

Headers: 
    `Authorization:  Bearer <token>`
    
    `POST /users/me`

- Request body : 
	- `image`: Il file binario dell'immagine da caricare in formato  `.jpg`. 
- CODE: 
	- **201  Created**: L'immagine del profilo è stata caricata e salvata con successo.
	- **404 Bad Request** :  Non è stato caricato alcun file oppure la dimensione dell'immagine supera i 100KB .
	- **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
	- **415 Unsupported Media Type** : Il formato del file caricato non è valido (è consentito solo il formato `.jpg`).
	- **500 Internal Server Error**: errore di query o business logic.

- QUERY: 
Non viene utilizzata nesuna query in questo caso. La foto viene semplcimente salvata sul file ssytem.
---

#  PURCHASES

In questa sezione viene gestito lo storico delle transazioni.

Si è deciso di modellare *Purchases* come una sotto-collezione che è accessibile solo dalla persona richiedente. Questo garantisce la privacy e svincola dalla necessità di controllare se lo user che richiede lo storico corrisponda effettivamente al proprietario del profilo. Tutto questo viene fatto dal server stesso che effettua un controllo sul token del richiedente da cui estrae la sua identità. 
Quindi lo storico dei dati di un certo purchase è vincolato strettamente al proprietario del profilo attraverso la risorsa annidata nello USER → **/purchases**

All'interno della propria lista, l'utente può comunque raffinare la ricerca utilizzando filtri specifici per rintracciare un singolo prodotto o una transazione avvenuta in un preciso momento. Ogni record restituito include i link HATEOAS relativi alla scheda del prodotto.


Vediamo i metodi che possiamo applicare sull'endpoint **/purchases**:

# **/purchases**

## GET

- **GET** →Attraverso la GET si permette a uno user autenticato di  ottenere una risposta paginata  contenente il  proprio storico degli acquisti. È possibile filtrare la ricerca utilizzando i seguenti parametri opzionali di query, anche combinandoli tra loro per ottenere dei risultati più specifici: 
    - **`product_name`**: Permette di filtrare i risultati inserendo il nome del prodotto 
    - **`timestamp_transaction`**:  Permette di filtrare per gli acquisti che sono stati effettuati in una certa data o  in un periodo specifico.
	
  Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /purchases`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `username_vendor` (opzionale), `product_name` (opzionale), `timestamp_transaction`(opzionale)
        
    - Risposta:
        
  ```json
  {
  "size": 20,
  "page": 0,
  "product_name": "f",
  "timestamp_transaction": null,
  "next": "/purchases?product_name=f&size=20&page=1",
  "prev": null,
  "res": [
    {
      "id_purchase": 1042,
      "timestamp_transaction": "2024-05-11T18:15:00.000Z",
      "username_buyer": "dragan",
      "product_id": 1234,
      "product_name": "Folklore LP",
      "links": {
        "product_LNK": {
          "href": "/products/1234",
          "method": "GET"
        }
      }
    },
    {
      "id_purchase": 1088,
      "timestamp_transaction": "2024-06-01T10:30:00.000Z",
      "username_buyer": "dragan",
      "product_id": 9012,
      "product_name": "Fender Stratocaster",
      "links": {
        "product_LNK": {
          "href": "/products/9012",
          "method": "GET"
        }
      }
    }
  ]
 }
```   
    - CODE: 
	    - **200 OK**: La richiesta è andata a buon fine e viene restituito lo storico paginato degli acquisti dello user che fa la richiesta.
	    - **400 Bad Request**: I parametri di paginazione `size` o `page` risultano essere  numeri negativi o non validi.
        - **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
        - **500 Internal Server Error**: Errore di query o business logic.

    - QUERY:
         SELECT Pu.*, Pr.name AS product_name
        FROM Purchases AS Pu
        JOIN Products AS Pr ON (Pr.product_id = Pu.product_id)
        WHERE Pu.username_buyer = $1 
        AND Pr.name ILIKE $2
        AND ($3 = '' OR CAST(Pu.timestamp_transaction AS date) = CAST($3 AS date))
        ORDER BY Pu.timestamp_transaction DESC
        LIMIT $4 OFFSET $5;

        - $1 :  `username_buyer` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
        - $2 : `product_name` ricercato.  Se utilizzato, permette di  filtrare tutti i risultati che contengono la stringa inserita.
        - $4 : `timestamp_transaction` . Se inserito viene fatto il cast della data inserita dall'utente affinchè ci sia una corrispondenza di formato  rispetto a quella presente nel database. 
        - $4 : `size` indica quanti risultati mostrare .
        - $5 :`page` indica da quale riga partire .


## POST 

- **POST** → Attraverso la  POST si permette ad uno user, autenticato, di aggiungere l'acquisto di un articolo nella collezione `Purchases`.  Il sistema gestisce l'acquisto in modo diverso in base al tipo di prodotto. Per i prodotti `digital`, lo user può completare l'acquisto anche se non ha inserito un indirizzo nel proprio profilo. Per i prodotti `physical` , invece, risulta obbligatorio avere un indirizzo di consegna valido nel profilo per poter gestire la spedizione. Il `timestamp_transaction` non verrà passato nella richiesta ma generato con una Query SQL. Lo username del vendor verrà estratto tramite il product_id e pure lo username_buyer verrà estratto dal token di autenticazione.

   Headers: 
    `Authorization:  Bearer <token>`

	`POST /purchases`

- Richiesta: `product_id`
	- CODE: 
	    -  **201 Created**: Prodotto inserito con successo.
        - **400 Bad Request**:  I dati inviati nel corpo della richiesta sono errati o incompleti. 
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.
        - **500 Internal Server Error**: Errore di query o di business logic.
	    
  -QUERY:  

    SELECT username_vendor, type, quantity
    FROM Products
    WHERE product_id = $1;
    - $1: `product_id` identifica univocamente un prodotto. 
    →**Nota Bene**: Questa query  permette al sistema di recuperare i dati del prodotto necessari per i controlli successivi.

    SELECT zip_code, city, street, street_number, apartment_floor
    FROM Users
    WHERE username = $1;
    - $1: `username` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
    → **Nota Bene**: Questa query viene eseguita per controllare se ci sia un address. Facendo questa query si impedisce di scalare una quantità di un prodotto se l'utente non ha un indirizo di spedizione valido e completo.

    UPDATE Products
    SET quantity = quantity - 1
    WHERE product_id = $1
    - `product_id` identifica univocamente un prodotto. 
    →**Nota Bene**: Questa operazione viene eseguita solo se la colonna `quantity` del prodotto non è `NULL` (indipendentemente dal fatto che sia `physical` o  `digital`).


    INSERT INTO Purchases  (username_vendor, username_buyer,  product_id)
    VALUES ($1, $2, $3) ;

    - $1 : `username_vendor`  del venditore.  Questo valore non viene inserito manualmente dallo `user` , ma viene estratto automaticamente dal sistema tramite il `product_id` a cui è associato il prodotto .
    - $2 : `username_buyer` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
    - $3 : `product_id` identifica univocamente un prodotto. 
--- 

# FOLLOWS

In questa sezione viene data la possibilità di gestire la propria lista di followers e di poter seguire o meno i vendor.  

Si è deciso di modellare Follows come una sotto-collezione accessibile solo dal proprietario del profilo. Questo garantisce la privacy dei dati e svincola dalla necessità di controllare l'identità di chi fa la richiesta che viene gestita direttamente dal server tramite il token di autenticazione.

Di conseguenza, la lista dei seguiti è vincolata strettamente allo user loggato attraverso la risorsa annidata nello USER → `/follows`

Identifichiamo quindi due sotto-collezioni distinte: 
1. **Followers**: identifica gli users ( vendor o user semplici) che seguono un  determinato `vendor`. Questa lista è accessibile solo dal `vendor` stesso.
2. **Following**: identifica  la lista di tutti i  `vendor` che un determinato `user` ha deciso di seguire.

# 1) SOTTO-COLLEZIONE FOLLOWERS 

Rispetto alla sotto-risorsa FOLLOWERS in cui la richiesta effettuata dal vendor richiedente ritorna la lista degli username degli user che lo seguono. Consideriamo i seguenti metodi HTTP:

# **/followers**

## GET

- **GET** → Attraverso la GET si permette a un vendor, autenticato, di ottenere la  propria lista paginata  di tutte le persone che  lo seguono. Questa  richiesta può essere fatta esclusivamente dai `vendor`.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da recuperare la sua specifica lista di followers.  È possibile filtrare i risultati per username utilizzando il  parametro opzionale di query `follower` .

  Headers: 
    `Authorization:  Bearer <token>`

    `GET /followers`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `follower`(opzionale)
        
    - Risposta:
        
	```json
        {
          "size": 20,
          "page": 0,
          "q": "r",
          "next": "/me/followers?follower=r&size=20&page=1",
          "prev": null,
          "res": [
            { "follower": "r-pippo"},
            { "follower": "r-filippo"},
            { "follower": "r-dragan"},
            { "follower": "r-sabrina"},
            { "follower": "rebecca"},
            { "follower": "r-giorgia"},
            { "follower": "r-elena"}
          ]
	        }
	```
        
    - CODE: 
	    - **200 OK**: La richiesta è andata a buon fine e viene restituita la lista paginata dei followers di chi fa la richiesta.
	    - **400 Bad Request**: I parametri di paginazione `size` o `page` risultano essere numeri negativi o non validi.
	    - **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
	    - **403 Forbidden** : Lo user risulta autenticato ma non possiede un ruolo = `vendor` e perciò non è autorizzato ad accedere a questa risorsa.
	    - **500 Internal Server Error**: Errore di query o business logic.

  - QUERY:
    SELECT username_vendor 
    FROM Vendors 
    WHERE username_vendor = $1;
    - $1 : username del `vendor`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
    **Nota Bene**: Questa query viene fatta solo per controllare che lo user loggato sia veramente un vendor.

    SELECT follower
    FROM Follows
    WHERE following=$1 AND follower ILIKE  $2 
    LIMIT $3 OFFSET $4;

    - $1 : username del `vendor`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
    - $2 : username delle persone che seguono un certo `vendor`.  Se utilizzato, permette di  filtrare tutti i risultati che contengono la stringa inserita.
    - $3 : size` indica quanti risultati mostrare .
    - $4 :`page` indica da quale riga partire .

# 2) SOTTO-COLLEZIONE FOLLOWINGS 

La sotto-risorsa FOLLOWINGS espone, a uno user autenticato, la lista di chi lui segue.  Valutiamo ora i seguenti metodi HTTP:
# **/users/me/followings**

## GET

- **GET** →Attraverso  la GET si permette a uno user autenticato di ottenere la lista paginata  di tutti i `vendor` che  un certo `user` (sia lui stesso un vendor o uno user semplice)  segue.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da recuperare la sua specifica lista dei `vendor` seguiti. È possibile filtrare i risultati per username utilizzando il  parametro opzionale di query `q` .

	Headers: 
    `Authorization:  Bearer <token>`

    `GET /followings`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `q`(opzionale)
        
    - Risposta:
        
        ```json
        {
          "size": 20,
          "page": 0,
          "q": "r",
          "next": "/me/followings?q=r&size=20&page=1",
          "prev": null,
          "res": [
				 {
				      "following": "r-giorgia",
				      "links": {
				        "image_LNK": {
				          "href": "vendors/r-giorgia/image",
				          "method": "GET"
				        },
				        "list_products_LNK": {
				          "href": "vendors/r-giorgia/products",
				          "method": "GET"
				        },
				        "vendor_LNK": {
				          "href": "/vendors/r-giorgia",
				          "method": "GET"
				        }
				      }
				    },
				    {
				      "following": "r-dragan",
				      "links": {
				        "image_LNK": {
				          "href": "/vendors/r-dragan/image",
				          "method": "GET"
				        },
				        "list_products_LNK": {
				          "href": "/vendors/r-dragan/products",
				          "method": "GET"
				        },
				        "vendor_LNK": {
				          "href": "/vendors/r-dragan",
				          "method": "GET"
				        }
				      }
				    }
				  ]
        }
        ```
        
    - CODE: 
	    - **200 OK**: La richiesta è andata a buon fine e viene restituita la lista  paginata dei followings di chi fa la richiesta.
	    - **400 Bad Request**: I parametri di paginazione `size` o `page` risultano essere numeri negativi o non validi.
	    -  **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
        - **500 Internal Server Error**: Errore di query o business logic.

     - QUERY:
      SELECT following
      FROM Follows
      WHERE follower=$1 AND following ILIKE $2
      LIMIT $3 OFFSET $4;

      - $1 : username dello `user`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
      - $2 : username del `vendor` che ha seguito lo user loggato.  Se utilizzato, permette di  filtrare tutti i risultati che contengono la stringa inserita.
      -  $3 : size` indica quanti risultati mostrare .
      - $4 :`page` indica da quale riga partire .




## POST

- **POST** → Attraverso la POST si permette a uno user autenticato di poter iniziare a seguire un `vendor`. Il server effettua un controllo sul token da cui estrae l'identità del richiedente aggiornando la sua specifica lista di vendor seguiti. Questa azione è eseguibile da un qualsiasi user, sia lui stesso un vendor o  uno user semplice. Non è concesso di poter seguire di nuovo  un `vendor` che  si sta già seguendo.  

  Headers: 
    `Authorization:  Bearer <token>`
   
    `POST /followings`
    
    - Richiesta: `username_vendor` 
    - CODE: 
	    -  **201 Created**: Relazione di follow creata con successo.
	    -  **400 Bad Request**:  I dati inviati nel corpo della richiesta sono errati o incompleti .
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.     
        - **409 Conflict** : Lo user sta già seguendo il `vendor`specificato.
        - **500 Internal Server Error**: Errore di query o di business logic.

    - QUERY:
      SELECT username_vendor
      FROM Vendors
      WHERE username_vendor = $1;
      - `username_vendor`del vendor che si vuole  iniziare a seguire.
  → Questa query viene eseguita per verificare l'effettiva esistenza del vendor nel sistema.

    INSERT INTO Follows ( follower, following )
    VALUES ($1, $2);
    $1 : username dello user richiedente. Questo valore non viene inserito manualmente
    dallo user, ma viene estratto automaticamente dal sistema tramite il token di
    autenticazione.
    $2 : username del vendor che si è iniziato a seguire
    

# SPECIFICO FOLLOWING 

# **/followings/:username_vendor**

## DELETE 

- **DELETE** → Attraverso la DELETE si permette a uno user autenticato di poter smettere di seguire un certo `vendor`.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da poter eliminare il  `vendor` dalla sua specifica lista di seguiti. Non è concesso  smettere di seguire un `vendor` che non si  stava già seguendo. 

  Headers: 
    `Authorization:  Bearer <token>`
    
	 `DELETE /followings/:username_vendor`
    
    - Parametri: `username_vendor`
    - CODE: 
	    - **204  OK**: Relazione di follow eliminata con successo.
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.     
        - **404 Not Found**  : Lo user non sta seguendo il `vendor` specificato o il `vendor`  non esiste.
        - **500 Internal Server Error**: Errore di query o di business logic.

    - QUERY:
      DELETE  
      FROM Follows
      WHERE follower= $1 AND following = $2 ;

      - $1 : username dello `user`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
      - $2 : username del `vendor` che si vuole smettere di  seguire. 
---
# COLLEZIONE  PRODUCT

Cosa un utente può fare sulla collezione PRODUCT? 

Consideriamo la collezione dei PRODUCT:

# /products

## GET 

- **GET** → Attraverso la GET si permette a qualsiasi user (anche non loggato) di ottenere una risposta, paginata,  con la lista dei prodotti presenti nella collezione.  È inoltre possibile filtrare i prodotti cercati in base al loro nome, tramite il parametro di query `q`,  o al loro tipo (`physical`, `digital` ) tramite il parametro `type`.  All'interno della risposta, ogni prodotto conterrà anche i propri link ipertestuali (HATEOAS) per raggiungere direttamente le risorse collegate, come la foto del prodotto, il profilo del vendor o la lista dei prodotti messi in vendita dal vendor .

	-  **Esempio di richiesta totale (senza filtri):** `/products?size=20&page=0`
	-  **Esempio di ricerca globale (name)** : /products?q={product_name}&size=20&page=0` 
	- **Esempio di ricerca per name filtrata per tipo(name+type)** : /products?q={product_name}&type={physical | digital}&size=20&page=0 
    
    `GET /products`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `q`, `type` (`physical` o `digital`, opzionale).
        
    - Risposta:
    ```json
        {
  "size": 20,
  "page": 0,
  "q": "cult",
  "type": null,
  "next":"/products?q=cult&size=20&page=1",
  "prev": null,
  "res": [
    {
      "product_id": 9876,
      "name": "Giacca pelle cult 'TARDIS'",
      "description": "Giacca di pelle custom con fodera interna a tema TARDIS",
      "quantity": 1,
      "price": 250,
      "timestamp_put_on_sale": "2026-06-19 14:30:00",
      "type": "physical",
      "byte": null,
      "weight_in_kg": 2.2,
      "username_vendor": "elena",
      "vendor_LNK": {
        "href": "/vendors/elena",
        "method": "GET"
      },
      "image_LNK": {
        "href": "/products/9876/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/vendors/elena/products",
        "method": "GET"
      },
       "product_LNK": {
        "href": "/products/9876",
        "method": "GET"
      }
    },
    {
      "product_id": 5432,
      "name": "File 3D Oggetto Cult Marvel",
      "description": "Modello digitale ad alta risoluzione del Guanto dell'Infinito di Thanos pronto per la stampa.",
      "quantity": 99,
      "price": 25,
      "timestamp_put_on_sale": "2026-06-20 21:05:00",
      "type": "digital",
      "byte": 43567104,
      "weight_in_kg": null,
      "username_vendor": "giorgia",
      "vendor_LNK": {
        "href": "/vendors/giorgia",
        "method": "GET"
      },
      "image_LNK": {
        "href": "/products/5432/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/vendors/giorgia/products",
        "method": "GET"
      }, 
      "product_LNK": {
        "href": "/products/5432",
        "method": "GET"
      }
    }
  ]
}
	```    
        
    - CODE:
        
        - **200 OK**: La richiesta è andata a buon fine e viene restituita la lista paginata dei prodotti (anche se la lista è vuota).
	      - **400 Bad Request**: I parametri di paginazione `size` o `page` risultano essere  numeri negativi o non validi.
        - **500 Internal Server Error**: Errore di query o business logic

     - QUERY: 
  
        SELECT *
        FROM Products
        WHERE type= ANY($1) AND name ILIKE $2
        LIMIT $3 OFFSET $4 ;`

        - $1: `type`  del product . Se questo parametro viene specificato i risultati verranno filtrati solo  per un tipo specifico di prodotti ( physical, digital).
        - $2 : `name` del product si può inserire per filtrare i prodotti per un certo nome .
        - $3 : `size` indica quanti risultati mostrare .
        - $4 :`page` indica da quale riga partire .

## POST 

- **POST** → Attraverso la POST si permette a uno user autenticato l'inserimento di un nuovo prodotto nel catalogo. Questa azione è riservata esclusivamente agli utenti con profilo di `type`=`vendor`.  Attraverso il token di autenticazione il sistema identifica automaticamente il vendor che sta pubblicando il prodotto, evitando l'inserimento manuale dello `username_vendor`.  I campi `product_id` e `timestamp_put_on_sale` sono generati automaticamente dal sistema e non devono essere inclusi nella richiesta. Inoltre, il `vendor` non dovrà specificare il `type` del prodotto  poiché il sistema lo stabilir automaticamente attraverso dei controlli sui campi inseriti.

   Headers: 
    `Authorization:  Bearer <token>`

	`POST /products`
    
	- Richiesta: `name`, `description`, `quantity`, `price`, `type`(`physical` o `digital`)
		- `weight_in_kg` (richiesto solo se `type` è `physical`)
	    - `byte` (richiesto solo se `type` è `digital`)

    - CODE:
        - **201 Created**: Prodotto inserito con successo.
        - **400 Bad Request**:  I dati inviati nel corpo della richiesta sono errati o incompleti.
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.
        - **403 Forbidden**: L'utente risulta autenticato ma non ha il ruolo di `vendor`quindi non è autorizzato ad aggiungere prodotti nel catalogo.                                                
        - **500 Internal Server Error**: Errore di query o di business logic.

    - QUERY :
    SELECT username_vendor
    FROM Vendors
    WHERE username_vendor = $1
      -  username dello user richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione. 
      **Nota Bene** :Questa query serve a fare un contorllo per vedere che chi fa la richiesta sia un vendor.

     INSERT INTO Products(name,description, quantity, price, type, byte, weight_in_kg, username_vendor)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ) ;
      - $1:  `name`del product che non può essere null.
      - $2:  `description` del product che non può essere null. 
      - $3: `quantity` del product che può essere null. Questo comporta che la quantità sia illimitata.
      - $4: `price` del product che non può essere null.
      - $5: `type` del product che viene stabilito automaticamente dal sistema.
      - $6 : `byte` del product che può essere null se il prodotto è di tipo `physical`.
      - $7 :  `weight_in_kg`  del product che può essere null se il prodotto è di tipo `digital`.
      - $8:  `username_vendor` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
---

# SINGOLO PRODOTTO   

Consideriamo il singolo elemento PRODUCT :

# **/products/:product_id**

## GET

- **GET** → Attraverso la GET si permette ad un qualsiasi  user (anche non loggato)  di poter ricercare un certo prodotto attraverso il suo `product_id`. 
    
    `GET /products/:product_id`
    
    - Parametri: `product_id`
        
    - Risposta:
        
        ```json
     {
		  "product_id": 5678,
		  "name": "Cacciavite Sonico Usato",
		  "description": "Modello Mark VII. Funziona alla grande su tutto, ma non chiedetemi di usarlo sul legno.",
		  "quantity": 1,
		  "price": 800,
		  "timestamp_put_on_sale": "2026-06-21 15:30:00",
		  "type": "physical",
		  "byte": null,
		  "weight_in_kg": 0.3,
		  "username_vendor": "filippo",
		   "vendor_LNK": {
	        "href": "/vendors/filippo",
	        "method": "GET"
	      },
	      "image_LNK": {
	        "href": "/products/5678/image",
	        "method": "GET"
	      },
	      "list_products_LNK": {
	        "href": "/vendors/filippo/products",
	        "method": "GET"
	      }
		}
        ```
        
    - CODE:
        
        - **200 OK**: La richiesta è andata a buon fine e vengono restituiti tutti i dati relativi ad un certo prodotto.
        - **400 Bad Request**: Il Product_id fornito non rispetta il formato previsto nel sistema.
        - **404 Not Found**: Viene ritornato se il `product_id` fornito non è associato ad alcun prodotto.
        - **500 Internal Server Error** : Errore di query o di business logic.

    - QUERY :
  
    SELECT *
    FROM Products
    WHERE product_id= $1 ;

    - $1 : `product_id` identifica univocamente un prodotto. 

## PATCH 

- **PATCH** → Attraverso la PATCH si permette ad un vendor  autenticato di poter modificare alcuni parametri dei suoi prodotti (`quantity`, `name`, `description`). Il server effettua un controllo sul token del richiedente per verificare che l'identità del venditore coincida con il proprietario del prodotto, impedendo modifiche non autorizzate su prodotti appartenenti ad altri `vendor`. Per avere una consistenza dei dati nello storico degli acquisti, una volta messo in vendita un prodotto, non verrà concessa la  modifica del `type` e degli attributi opzionali (`weight_in_kg`, `byte`) .

   Headers: 
    `Authorization:  Bearer <token>`
    
	`PATCH /products/:product_id`
	
- Parametri: `name`, `description`, `quantity`
    - Risposta: rappresentazione del  prodotto modificato

    - CODE:
	    - **200 OK**: Se la richiesta di modifica va a buon fine.
	    - **400 Bad Request**: Se vengono passati parametri non permessi o malformati.
	    - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato e non può effettuare la modifica.
	    - **403 Forbidden**: Lo user è autenticato ma non ha l'autorizzazione a modificare la risorsa. Questo accade se il vendor associato al token non corrisponde al proprietario effettivo del prodotto che si intende modificare.
	    - **404 Not found** : Il prodotto che si vuole modificare non esiste.
	    -  **500 Internal Server Error**: errore di query o business logic.

  - QUERY :
 
      SELECT username_vendor
       FROM Products
      WHERE product_id = $1;

      - product_id del prodotto.
      **Noat Bene** : Questa query viene svolta per verifiacare due cose:
        1) Se c'è il prodotto con quel product_id
        2) Se il proprietario del prodotto è lo stesso che sta afcendo la patch


    UPDATE Products
     SET name = COALESCE($1, name),
     description = COALESCE($2, description),
     quantity = COALESCE($3, quantity)
     WHERE product_id = $4 AND username_vendor = $5
     RETURNING *;

     - $1 :  `name` di un determinato prodotto che può essere modificata.
     - 2 : `description` di un determinato prodotto che può essere modificata.
     - $3:  `quantity` di un determinato prodotto che può essere modificata.
     - $4 : `product_id` del product.  Il prodotto deve appartenere alla lista dei prodotti messi in vendita dal `vendor` richiedente. 
     - $5 : `username_vendor ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
   
   
   
---
# IMMAGINI SINGOLO PRODOTTO
# /products/:product_id/ image

## GET

- **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere, di un prodotto,  una specifica immagine. Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'immagine profilo 

    `GET /products/:product_id/image`
    
-  Parametri (GET):   `product_id`
        
    - Risposta:  foto in .jpeg (se presente)

- CODE : 
	-  **200 OK**: La richiesta è andata a buon fine e  viene restituita immagine del prodotto.
	- **400 Bad Request** : Il  `product_id` inserito non è valido o è malformato
	- **404 Not Found** : La richiesta risulta valida, ma la risorsa cercata tramite il product non esite. Questo errore può esere ritornato anche nel caos in cui il product_id non esista. 
	- **500 Internal Server Error**: errore di query o business logic.

- QUERY:
   SELECT product_id
    FROM Products
    WHERE  product_id = $1;

  - $1: product_id del prodotto.


## POST 

-  **POST** → Attraverso la POST si permette ad un vendor, autenticato e proprietario di un certo prodotto, di poter pubblicare  una nuova immagine per il proprio prodotto.  Il proprietario del prodotto viene estratto tramite il `product_id`.

Headers: 
    `Authorization:  Bearer <token>`
    
    `POST /products/:product_id`

- Request body : 
	- `image`: Il file binario dell'immagine da caricare in formato  `.jpg`. 
- CODE: 
	- **201  Created**: L'immagine del prodotto è stata caricata e salvata con successo.
	- **400 Bad Request** :  La richiesta è malformata perché il file è assente,  la dimensione dell'immagine supera il limite massimo di 100KB o il product_id non è associato a nessun prodotto di proprietà del vendor richiedente .
	- **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
  - ** 404 Not Found** : Il product_id su cui si voleva fare la POST non esiste.
	- **415 Unsupported Media Type** : Il formato del file caricato non è valido (è consentito solo il formato `.jpg`).
	- **500 Internal Server Error**: errore di query o business logic.

- QUERY: 
   SELECT product_id
    FROM Products
    WHERE product_id = $1

  - $1: product_id del prodotto

--- 

# SCHEMA ENDPOINT FINALI

#### Authentication
* POST /users 
* POST /sessions 
* PATCH /sessions 
* DELETE /sessions (Richiede auth) 

#### Vendors
* GET /vendors (Richiede auth) 
* GET /vendors/:username (Richiede auth) 
* GET /vendors/:username/image (Richiede auth) 
* GET /vendors/:username/purchases (Richiede auth)

#### Profile
* GET /me (Richiede auth) 
* GET /me/image (Richiede auth) 
* POST /me/image (Richiede auth) 
* PATCH /me (Richiede auth) 

#### Purchases
* GET /purchases (Richiede auth) 
* POST /purchases (Richiede auth) 

#### Follows
* GET /followers (Richiede auth) 
* GET /followings (Richiede auth) 
* POST /followings (Richiede auth) 
* DELETE /followings/:following (Richiede auth) 

#### Products
* GET /products -> getProducts
* POST /products (Richiede auth) 
* GET /products/:product_id 
* GET /products/:product_id/image 
* POST /products/:product_id/image (Richiede auth) 
* PATCH /products/:product_id (Richiede auth) 