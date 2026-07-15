Nome, Cognome: Rebecca Fulginiti 
Matricola : 26182A

### **API REST DEL PROGETTO IBUY**  

#  SESSIONI 
# /login

## POST 

- **POST** → Attraverso la POST si permette allo user, immettendo le sue credenziali (username, password), di effettuare il login. Se i dati sono corretti, il server genera e restituisce un token di autenticazione.
    
    `POST /login`
    
    - Request body: 
    ```json
    {
    "username": "string" ,
    "password": "string"
    }
    ```
    - CODE:
        - **200 OK **: La richiesta è andata a buon fine. Viene generato un token di autenticazione.
        - **400 Bad Request**: I dati inviati nel corpo della richiesta sono errati o incompleti.
        - **401 Unauthorized**:  Le credenziali inserite sono errate.
	    - **500 Internal Server Error**: Errore di query o business logic.

# /refresh
## POST

- **POST** → Attraverso la POST si permette allo user di poter rigenerare il token di sessione.  Viene inserito il refresh token che è stato fornito durante il login.  Lo username dello user, che viene ricercato nel database, viene estratto dal payload del token.

`POST  /refresh`
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

# /logout
## POST

- **POST** → Attraverso la POST si permette allo user, autenticato, di poter effettuare il logout. 

Headers: 
    `Authorization:  Bearer <token>`
    
    `POST /logout`
   - CODE : 
	   -  **200 OK**: La richiesta è andata a buon fine e l'utente viene scollegato correttamente.
	   - **401 Unauthorized**:  Token non valido o malformato.
	   - **500 Internal Server Error**: Errore di query o business logic.
	
---
# COLLEZIONE USER

Consideriamo la collezione degli USER:
#  **/users**  

## POST (registrazione nuovo user)

- **POST** → Attraverso la POST si permette la creazione di un nuovo account.  Lo user verrà classificato come  `type`= 'user' di default a meno che non venga inserito il numero di partita IVA (VAT_NUMBER), in quel caso comporterà che il `type`= `vendor`.  Il sistema inoltre controlla che lo username, la mail e VAT_NUMBER (opzionale) inseriti non esistano già nel sistema, in tal caso gli viene ritornato un errore.
    
    `POST /users`
    
    -  Request body: `username`, `mail`, `password`, `zip_code` (opzionale), `city` (opzionale), `street` (opzionale), `street_number` (opzionale), `apartment_floor` (opzionale),  `VAT_number` (opzionale)
    - CODE:
        - **201 Created**: La richiesta è andata a buon fine. Il nuovo user viene creato e aggiunto nel database.
        - **400 Bad Request**: I dati inviati nel corpo della richiesta sono errati, incompleti o la mail non ha un formato valido.
        - **409 Conflict**: Lo username, la mail  o il VAT_ NUMBER inseriti sono già associati a uno user  esistente .
	    - **500 Internal Server Error**: Errore di query o business logic.
	    
#  **/users/vendors**

## GET

- **GET** → Attraverso la GET si permette a uno user autenticato di ottenere una risposta, paginata, con la lista dei profili dei `vendor` presenti nella collezione. È inoltre possibile filtrare i risultati facendo una ricerca per username tramite i parametri di query (q). Per motivi di privacy si è scelto di far restituire solo i dati pubblici essenziali :
	-  Lo username del vendor
	- Il link ipertestuale per recuperare la foto profilo del vendor  tramite i link HATEOAS.
	- La lista dei prodotti messi in vendita da quel venditore tramite i link HATEOAS .
	- **Il link diretto al profilo completo** del vendor, sempre usando i link HATEOAS.
    
    Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /users/vendors`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `q`
        
    - Risposta:
    ```json
{
  "size": 20,
  "page": 0,
  "q": "fil",
  "next": "/users/vendors?q=fil&size=20&page=1",
  "prev": null,
  "res": [
	{
    "username": "filippo",
    "city": "Milano",
    "links": {
      "image_LNK": {
        "href": "/users/vendors/filippo/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/users/vendors/filippo/products",
        "method": "GET"
      },
      "vendor_LNK": {
        "href": "/users/vendors/filippo",
        "method": "GET"
      }
    }
  },
	{
    "username": "filomena",
    "city": "Roma",
    "links": {
      "image_LNK": {
        "href": "/users/vendors/filomena/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/users/vendors/filomena/products",
        "method": "GET"
      },
      "vendor_LNK": {
        "href": "/users/vendors/filomena",
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


---

# SINGOLO  USER

Consideriamo il singolo elemento USER :
Bisogna notare che viene fatta una netta distinzione sui dati che vengono restituiti rispetto a chi li richiede. Nello specifico evidenziamo due casi:

1. **Endpoint Dati Pubblici** : Sull'endpoint `/users/vendors/:username`  si possono richiedere tutti i dati  pubblici dei vendor. Questo comporta che i dati sensibili non vengano restituiti ma i dettagli del vendor che verrano forniti in risposta saranno  i seguenti: 
	1. Lo username,
	2. a città di residenza,
	3. Il link ipertestuale per recuperare la foto profilo del vendor  tramite i link HATEOAS.
	4. La lista dei prodotti messi in vendita tramite i link HATEOAS relativi alle risorse collegate. 
2.  **Endpoint Dati Privati** : Sull'endpoint `/users/me` si possono richiedere tutti i dati personali dello user che effettua la richiesta esclusa la password. Prima di ritornare la risposta il server estrae l'identità dello user direttamente dal token.
#  **/users/vendors/:username**

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
        "href": "/users/vendors/bettinz/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/users/vendors/bettinz/products",
        "method": "GET"
      },
      "vendor_LNK": {
        "href": "/users/vendors/bettinz",
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

---

# IMMAGINE PROFILO SINGOLO VENDOR 
# /users/vendors/:username/image

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

---

# PROFILE 
# /users/me

## GET

- **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere **solo** i propri dati personali . Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'intero profilo privato (esclusa la password) più i vari link ipertestuali. Se l'utente autenticato è uno user normale (e non un vendor), il link `followers_LNK` non verrà restituito.
    
    Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /users/me`
    
    - Parametri (GET):   nessuno ( l'identità viene estratta dal token)
        
    - Risposta:

	```json
{
    "username": "dragan",
    "mail": "dragan.v@mail.com",
    "type": "vendor",
    "zip_code": "10121",
    "city": "Torino",
    "street": "Garibaldi",
    "street_number": "5",
    "apartment_floor": null,
    "vat_number": "IT0098765432109",
    "links": {
      "image_LNK": {
        "href": "/users/vendors/dragan/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/users/vendors/dragan/products",
        "method": "GET"
      },
      "patch": {
        "href": "/users/vendors/dragan",
        "method": "PATCH"
      },
      "purchase_LNK": {
        "href": "/users/vendors/dragan/purchases",
        "method": "GET"
      },
      "followers_LNK": {
        "href": "/users/vendors/dragan/followers",
        "method": "GET"
      },
      "followings_LNK": {
        "href": "/users/vendors/dragan/followings",
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
    -  **500 Internal Server Error**: Errore di query o business logic.

---
# IMMAGINI  SINGOLO USER

#  /users/me/image

## GET

 - **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere **solo** la propria immagine di profilo. Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'immagine profilo 
    
Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /users/me`
    
-  Parametri (GET):   nessuno ( l'identità viene estratta dal token)
        
    - Risposta:  foto in jpeg (se presente)

- CODE : 
	-  **200 OK**: La richiesta è andata a buon fine e  viene restituita immagine del profilo personale.
	- **401 Unauthorized**: Il token non risulta valido quindi lo user non è autenticato.
	- **404 Not Found** : La richiesta risulta valida, ma la risorsa non è disponibile poiché l'utente non ha impostato alcuna immagine del profilo.
	- **500 Internal Server Error**: errore di query o business logic.

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

---

#  PURCHASES

In questa sezione viene gestito lo storico delle transazioni.

Si è deciso di modellare *Purchases* come una sotto-collezione che è accessibile solo dalla persona richiedente. Questo garantisce la privacy e svincola dalla necessità di controllare se lo user che richiede lo storico corrisponda effettivamente al proprietario del profilo. Tutto questo viene fatto dal server stesso che effettua un controllo sul token del richiedente da cui estrae la sua identità. 
Quindi lo storico dei dati di un certo purchase è vincolato strettamente al proprietario del profilo attraverso la risorsa annidata nello USER → **/users/me/purchase**

All'interno della propria lista, l'utente può comunque raffinare la ricerca utilizzando filtri specifici per rintracciare un singolo prodotto o una transazione avvenuta in un preciso momento. Ogni record restituito include i link HATEOAS relativi alle risorse collegate come:
- La scheda del prodotto 
- Il profilo del venditore 

Vediamo i metodi che possiamo applicare sull'endpoint **/users/me/purchase**:

# **/users/me/purchases**

## GET

- **GET** →Attraverso la GET si permette a uno user autenticato di  ottenere una risposta paginata  contenente il  proprio storico degli acquisti. È possibile filtrare la ricerca utilizzando i seguenti parametri opzionali di query, anche combinandoli tra loro per ottenere dei risultati più specifici: 
    - **`product_name`**: Permette di filtrare i risultati inserendo il nome del prodotto
    - **`username_vendor`**: Permette di filtrare i risultati inserendo lo username del vendor . 
    - **`timestamp_transaction`**:  Permette di filtrare per gli acquisti che sono stati effettuati in una certa data o  in un periodo specifico.
	
  Headers: 
    `Authorization:  Bearer <token>`
    
    `GET /users/me/purchases`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `username_vendor` (opzionale), `product_name` (opzionale), `timestamp_transaction`(opzionale)
        
    - Risposta:
        
        ```json
  {
  "size": 20,
  "page": 0,
  "username_vendor": "fil",
  "product_name": null,
  "timestamp_transaction": null,
  "next": "/users/me/purchases?username_vendor=fil&size=20&page=1",
  "prev": null,
  "res": [
    {
      "timestamp_transaction": "2024-05-11T18:15:00.000Z",
      "username_vendor": "filomena",
      "username_buyer": "dragan",
      "product_id": 1234,
      "name": "Foklore LP",
      "links": {
        "image_LNK": {
          "href": "/users/vendors/filomena/image",
          "method": "GET"
        },
        "list_products_LNK": {
          "href": "/users/vendors/filomena/products",
          "method": "GET"
        },
        "product_LNK": {
          "href": "/products/1234",
          "method": "GET"
        },
        "vendor_LNK": {
          "href": "/users/vendors/filomena",
          "method": "GET"
        }
      }
    },
    {
      "timestamp_transaction": "2026-04-19T18:16:00.000Z",
      "username_vendor": "filippo",
      "username_buyer": "dragan",
      "product_id": 5678,
      "name": "Bottle of patience. Limited Edition!",
      "links": {
        "image_LNK": {
          "href": "/users/vendors/filippo/image",
          "method": "GET"
        },
        "list_products_LNK": {
          "href": "/users/vendors/filippo/products",
          "method": "GET"
        },
        "product_LNK": {
          "href": "/products/5678",
          "method": "GET"
        },
        "vendor_LNK": {
          "href": "/users/vendors/filippo",
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


## POST 

- **POST** → Attraverso la  POST si permette ad uno user, autenticato, di aggiungere l'acquisto di un articolo nella collezione `Purchases`.  Il sistema gestisce l'acquisto in modo diverso in base al tipo di prodotto. Per i prodotti `digital`, lo user può completare l'acquisto anche se non ha inserito un indirizzo nel proprio profilo. Per i prodotti `physical` , invece, risulta obbligatorio avere un indirizzo di consegna valido nel profilo per poter gestire la spedizione. Il `timestamp_transaction` non verrà passato nella richiesta ma generato con una Query SQL. Lo username del vendor verrà estratto tramite il product_id e pure lo username_buyer verrà estratto dal token di autenticazione.

   Headers: 
    `Authorization:  Bearer <token>`

	`POST /users/me/purchases`

- Richiesta: `product_id`
	- CODE: 
	    -  **201 Created**: Prodotto inserito con successo.
        - **400 Bad Request**:  I dati inviati nel corpo della richiesta sono errati o incompleti. 
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.
        - **500 Internal Server Error**: Errore di query o di business logic.
	    

--- 

# FOLLOWS

In questa sezione viene data la possibilità di gestire la propria lista di followers e di poter seguire o meno i vendor.  

Si è deciso di modellare Follows come una sotto-collezione accessibile solo dal proprietario del profilo. Questo garantisce la privacy dei dati e svincola dalla necessità di controllare l'identità di chi fa la richiesta che viene gestita direttamente dal server tramite il token di autenticazione.

Di conseguenza, la lista dei seguiti è vincolata strettamente allo user loggato attraverso la risorsa annidata nello USER → `/users/me/follows`

Identifichiamo quindi due sotto-collezioni distinte: 
1. **Followers**: identifica gli users ( vendor o user semplici) che seguono un  determinato `vendor`. Questa lista è accessibile solo dal `vendor` stesso.
2. **Following**: identifica  la lista di tutti i  `vendor` che un determinato `user` ha deciso di seguire.

# 1) SOTTO-COLLEZIONE FOLLOWERS 

Rispetto alla sotto-risorsa FOLLOWERS in cui la richiesta effettuata dal vendor richiedente ritorna la lista degli username degli user che lo seguono. Consideriamo i seguenti metodi HTTP:

# **/users/me/followers**

## GET

- **GET** → Attraverso la GET si permette a un vendor, autenticato, di ottenere la  propria lista paginata  di tutte le persone che  lo seguono. Questa  richiesta può essere fatta esclusivamente dai `vendor`.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da recuperare la sua specifica lista di followers.  È possibile filtrare i risultati per username utilizzando il  parametro opzionale di query `q` .

  Headers: 
    `Authorization:  Bearer <token>`

    `GET /users/me/followers`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `q`(opzionale)
        
    - Risposta:
        
	```json
        {
          "size": 20,
          "page": 0,
          "q": "r",
          "next": "/users/me/followers?q=r&size=20&page=1",
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


# 2) SOTTO-COLLEZIONE FOLLOWINGS 

La sotto-risorsa FOLLOWINGS espone, a uno user autenticato, la lista di chi lui segue.   Valutiamo ora i seguenti metodi HTTP:
# **/users/me/followings**

## GET

- **GET** →Attraverso  la GET si permette a uno user autenticato di ottenere la lista paginata  di tutti i `vendor` che  un certo `user` (sia lui stesso un vendor o uno user semplice)  segue.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da recuperare la sua specifica lista dei `vendor` seguiti. È possibile filtrare i risultati per username utilizzando il  parametro opzionale di query `q` .

	Headers: 
    `Authorization:  Bearer <token>`

    `GET /users/me/followings`
    
    - Parametri (GET): `size` (1-20), `page` (0-n), `q`(opzionale)
        
    - Risposta:
        
        ```json
        {
          "size": 20,
          "page": 0,
          "q": "r",
          "next": "/users/me/followings?q=r&size=20&page=1",
          "prev": null,
          "res": [
				 {
				      "following": "r-giorgia",
				      "links": {
				        "image_LNK": {
				          "href": "/users/vendors/r-giorgia/image",
				          "method": "GET"
				        },
				        "list_products_LNK": {
				          "href": "/users/vendors/r-giorgia/products",
				          "method": "GET"
				        },
				        "vendor_LNK": {
				          "href": "/users/vendors/r-giorgia",
				          "method": "GET"
				        }
				      }
				    },
				    {
				      "following": "r-dragan",
				      "links": {
				        "image_LNK": {
				          "href": "/users/vendors/r-dragan/image",
				          "method": "GET"
				        },
				        "list_products_LNK": {
				          "href": "/users/vendors/r-dragan/products",
				          "method": "GET"
				        },
				        "vendor_LNK": {
				          "href": "/users/vendors/r-dragan",
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

## POST

- **POST** → Attraverso la POST si permette a uno user autenticato di poter iniziare a seguire un `vendor`. Il server effettua un controllo sul token da cui estrae l'identità del richiedente aggiornando la sua specifica lista di vendor seguiti. Questa azione è eseguibile da un qualsiasi user, sia lui stesso un vendor o  uno user semplice. Non è concesso di poter seguire di nuovo  un `vendor` che  si sta già seguendo.  

  Headers: 
    `Authorization:  Bearer <token>`
   
    `POST /users/me/followings`
    
    - Richiesta: `username_vendor` 
    - CODE: 
	    -  **201 Created**: Relazione di follow creata con successo.
	    -  **400 Bad Request**:  I dati inviati nel corpo della richiesta sono errati o incompleti .
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.     
        - **409 Conflict** : Lo user sta già seguendo il `vendor`specificato.
        - **500 Internal Server Error**: Errore di query o di business logic.


# SPECIFICO FOLLOWING 

# **/users/me/followings/:username_vendor**

## DELETE 

- **DELETE** → Attraverso la DELETE si permette a uno user autenticato di poter smettere di seguire un certo `vendor`.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da poter eliminare il  `vendor` dalla sua specifica lista di seguiti. Non è concesso  smettere di seguire un `vendor` che non si  stava già seguendo. 

  Headers: 
    `Authorization:  Bearer <token>`
    
	 `DELETE /users/me/followings/:username_vendor`
    
    - Parametri: `username_vendor`
    - CODE: 
	    - **204  OK**: Relazione di follow eliminata con successo.
        - **401 Unauthorized**:  Il token non risulta valido quindi lo user non è autenticato.     
        - **404 Not Found**  : Lo user non sta seguendo il `vendor` specificato o il `vendor`  non esiste.
        - **500 Internal Server Error**: Errore di query o di business logic.

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
      "image_url": "/product_Picture/9876.jpg",
      "type": "physical",
      "byte": null,
      "weight_in_kg": 2.2,
      "username_vendor": "elena",
      "vendor_LNK": {
        "href": "/users/vendors/elena",
        "method": "GET"
      },
      "image_LNK": {
        "href": "/product/9876/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/users/vendors/elena/products",
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
      "image_url": "/product_Picture/5432.jpg",
      "type": "digital",
      "byte": 43567104,
      "weight_in_kg": null,
      "username_vendor": "giorgia",
      "vendor_LNK": {
        "href": "/users/vendors/giorgia",
        "method": "GET"
      },
      "image_LNK": {
        "href": "/products/5432/image",
        "method": "GET"
      },
      "list_products_LNK": {
        "href": "/users/vendors/giorgia/products",
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
		   "image_url" : "products/5678/image",
		  "type": "physical",
		  "byte": null,
		  "weight_in_kg": 0.3,
		  "username_vendor": "filippo",
		   "vendor_LNK": {
	        "href": "/users/vendors/filippo",
	        "method": "GET"
	      },
	      "image_LNK": {
	        "href": "/products/5678/image",
	        "method": "GET"
	      },
	      "list_products_LNK": {
	        "href": "/users/vendors/filippo/products",
	        "method": "GET"
	      }
		}
        ```
        
    - CODE:
        
        - **200 OK**: La richiesta è andata a buon fine e vengono restituiti tutti i dati relativi ad un certo prodotto.
        - **400 Bad Request**: Il Product_id fornito non rispetta il formato previsto nel sistema.
        - **404 Not Found**: Viene ritornato se il `product_id` fornito non è associato ad alcun prodotto.
        - **500 Internal Server Error** : Errore di query o di business logic.

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
	- **404 Not Found** : La richiesta risulta valida, ma la risorsa non è disponibile poiché l'utente non ha caricato alcuna immagine del prodotto.
	- **500 Internal Server Error**: errore di query o business logic.

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
	- **415 Unsupported Media Type** : Il formato del file caricato non è valido (è consentito solo il formato `.jpg`).
	- **500 Internal Server Error**: errore di query o business logic.

--- 

# SCHEMA ENDPOINT FINALI

#### Authentication
* POST /users 
* POST /login 
* POST /refresh 
* POST /logout (Richiede auth) 

#### Vendors
* GET /users/vendors (Richiede auth) 
* GET /users/vendors/:username (Richiede auth) 
* GET /users/vendors/:username/image (Richiede auth) 

#### Profile
* GET /users/me (Richiede auth) 
* GET /users/me/image (Richiede auth) 
* POST /users/me/image (Richiede auth) 
* PATCH /users/me (Richiede auth) 
* GET /users/me/purchases (Richiede auth) 
* POST /users/me/purchases (Richiede auth) 
* GET /users/me/followers (Richiede auth) 
* GET /users/me/followings (Richiede auth) 
* POST /users/me/followings (Richiede auth) 
* DELETE /users/me/followings/:following (Richiede auth) 

#### Products
* GET /products -> getProducts
* POST /products (Richiede auth) 
* GET /products/:product_id 
* GET /products/:product_id/image 
* POST /products/:product_id/image (Richiede auth) 
* PATCH /products/:product_id (Richiede auth) 