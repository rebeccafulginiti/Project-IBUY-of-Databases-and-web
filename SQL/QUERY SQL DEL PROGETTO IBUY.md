Nome, Cognome: Rebecca Fulginiti
Matricola : 26182A

### **QUERY SQL DEL PROGETTO IBUY**

#  SESSIONI 
# /login

## POST 

- **POST** → Attraverso la POST si permette allo user, immettendo le sue credenziali (username, password), di effettuare il login. Se i dati sono corretti, il server genera e restituisce un token di autenticazione.

QUERY: 
SELECT password, type
FROM users
WHERE username = $1;
- $1 :  `username` dell’utente da ricercare nel database per verificarne le credenziali . 

UPDATE users
SET session_id = $1
WHERE username = $2; 
- $1 :  `session_id` generato dal server.
- $2 : `username` trovato dalla SELECT .

# /refresh

### POST

- **POST** → Attraverso la POST si permette allo user, autenticato, di poter rigenerare il token di sessione.  Viene inserito il refresh token che è stato fornito durante il login. Lo username dello user, che viene ricercato nel database,  viene estratto dal payload del token.

QUERY: 
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

## POST 

- **POST** → Attraverso la POST si permette allo user, autenticato, di poter effettuare il logout. 

QUERY: 
UPDATE users
SET session_id = NULL
WHERE username = $1;
 $1 :  `username` dell’utente da ricercare nel database per impostare  il session_id a NULL.  

--- 
# COLLEZIONE USER

# /users

## POST

- POST→ Attraverso la POST andiamo ad aggiungere un nuovo `user`. Di default, il profilo viene creato con type= `user` . Se nel body viene fornito un VAT_NUMBER valido , il type viene impostato in automatico su `vendor`.

QUERY:  
INSERT INTO Users  (username,  mail, password, zip_code, city, street, street_number, apartment_floor, type, VAT_NUMBER)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);

- $1:  `username` dell’utente da registrare. 
- $2: `mail` dell’utente da registrare .
- $3: `password` dell’utente da registrare ( successivamente ne viene fatto l’hash per non salvare la password in chiaro nel DB).
- $4: `zip_code` che può essere null.
- $5: `city` che può essere null.
- $6:  `street`  che può essere null.
- $7:  `street_number`  che può essere null.
- $8: `apartment_floor`  che può essere null.
- $9:  `type` che di default è `user`.
- $10:  `VAT_number`  se viene inserito  questo parametro allora il  `type`  dello user sarà uguale a  `vendor`.

# /users/vendor

## GET

- GET→ Attraverso la GET è possibile recuperare la lista dei soli `vendor` presenti nella collezione. È possibile filtrare i risultati che contengono una certa stringa per username e anche ordinarli con un ordine ascendente o discendente. 

QUERY: 

SELECT username
FROM Users
WHERE type = 'vendor'  AND  username ILIKE  $1
ORDER BY username 
LIMIT $2 OFFSET $3 ;

- $1 :  `username` ricercato. Trova tutti i risultati che contengono la stringa inserita.
- $2: `size` indica quanti risultati mostrare .
- $3 :`page` indica da quale riga partire .
--> ASC se si vuole un ordine ascendente o DESC per discendente .


____

#  SINGOLO USER
# /users/vendor/:username

## GET

- GET→ Attraverso la GET si permette ad uno user autenticato di poter richiedere i dati di uno specifico vendor tramite il suo username. Per garantire la riservatezza e per mantenere la privacy il sistema non ritorna tutti dati,  ma, rispetto al GET sulla collezione,  viene restituito in più solo la città del vendor.  Se un vendor ricerca se stesso su questo endpoint vengono ritornati altri link HATEOAS come :
	- patch per fare modifiche la proprio profilo
	- purchase_LNK
	- followers_LNK
	- followings_LNK


QUERY: 

SELECT username, city
FROM Users
WHERE   type = 'vendor'  AND  username = $1  ;

- $1 : username_vendor che si vuole ricercare.

# /users/vendor/:username/image

## GET

- **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere l'immagine profilo, se presente, di un certo vendor. 

QUERY: 
SELECT image_url
FROM users
WHERE type = 'vendor' AND username = $1;
- $1 : username_vendor che si vuole ricercare.


---

# PROFILE 
# /users/me

## GET

-  GET→  Attraverso la GET si permette ad uno user autenticato di poter richiedere **solo** i propri dati personali . Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'intero profilo privato (esclusa la password) più i vari link ipertestuali. Se l'utente autenticato è uno user normale (e non un vendor), il link `followers_LNK` non verrà restituito.

QUERY: 

SELECT username,  mail, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER
FROM Users
WHERE username = $1 ;

- $1 :  `username`  del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.

## PATCH

- **PATCH** → Attraverso la PATCH si permette ad uno user autenticato di poter modificare solo alcuni dati. Il server effettua un controllo sul token del richiedente da cui estrae la sua identità in modo che i dati che vengano modificati siano della persona richiedente. 

 Parametri del Body:
 (`street`, `city`, `zip_code`, `street_number`, `apartment_floor`, `VAT_number`, `password`)

QUERY: 

UPDATE Users
SET street=$2, city=$3, zip_code=$4, street_number=$5, apartment_floor=$6, password=$7, type= $8, VAT_NUMBER=$9

WHERE username = $1 ;

-  $1:  `username ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2, $3, $4, $5, $6, $7, $9 : I nuovi valori inviati nel Body (se non inviati, manterranno il valore corrente).
- $8 : `type`  questo  valore viene calcolato in Node.js . Se uno `user` tenta di inserire questo parametro nel body viene ignorato  completamente dal backend.  
--- 
# IMMAGINI  SINGOLO USER

## GET  /users/me/image

 **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere **solo** la propria immagine di profilo. Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'immagine profilo 

QUERY: 
SELECT image_url
FROM users
WHERE username = $1

- $1:  `username ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.

## POST  /users/me/image

-  **POST** → Attraverso la POST si permette ad uno user, autenticato, di poter impostare una nuova immagine per il proprio profilo. 

QUERY: 
UPDATE users
SET image_url = $1
WHERE username = $2;

- $1:  `image_url ` è  la stringa contenente il percorso del server (`path`) in cui è stato salvato fisicamente il file.
- $2:  `username ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.

--- 
# COLLEZIONE PURCHASES

# /users/me/purchases

## GET 

- **GET** →Attraverso la GET si permette a uno user autenticato di  ottenere una risposta paginata  contenente il  proprio storico degli acquisti. È possibile filtrare la ricerca utilizzando i seguenti parametri opzionali di query, anche combinandoli tra loro per ottenere dei risultati più specifici: 
    - **`product_name`**: Permette di filtrare i risultati inserendo il nome del prodotto
    - **`username_vendor`**: Permette di filtrare i risultati inserendo lo username del vendor . 
    - **`timestamp_transaction`**:  Permette di filtrare per gli acquisti che sono stati effettuati in una certa data o  in un periodo specifico.

QUERY:
SELECT Pu.* , Pr.name
FROM Purchases AS Pu
JOIN Products AS Pr On ( Pr.product_id = Pu.product_id )
WHERE Pu.username_buyer = $1 
AND  Pu.username_vendor ILIKE $2  
AND Pr.name ILIKE $3
AND ($4 = '' OR CAST(Pu.timestamp_transaction AS date) = CAST($4 AS date))
LIMIT $5 OFFSET $6;

- $1 :  `username_buyer` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2 :`username_vendor` ricercato. Se utilizzato, permette di  filtrare tutti i risultati che contengono la stringa inserita.
- $3 : `product_name` ricercato.  Se utilizzato, permette di  filtrare tutti i risultati che contengono la stringa inserita.
- $4 : `timestamp_transaction` . Se inserito viene fatto il cast della data inserita dall'utente affinchè ci sia una corrispondenza di formato  rispetto a quella presente nel database. 
- $5 : `size` indica quanti risultati mostrare .
- $6 :`page` indica da quale riga partire .
## POST

- POST→ Attraverso la  POST si permette ad uno user, autenticato, di aggiungere l'acquisto di un articolo nella collezione `Purchases`.  Il sistema gestisce l'acquisto in modo diverso in base al tipo di prodotto. Per i prodotti `digital`, lo user può completare l'acquisto anche se non ha inserito un indirizzo nel proprio profilo. Per i prodotti `physical` , invece, risulta obbligatorio avere un indirizzo di consegna valido nel profilo per poter gestire la spedizione. Il `timestamp_transaction`  verrà generato automaticamente dal sistema e non deve essere incluso nella richiesta.

QUERY:  

SELECT username_vendor, type, quantity
FROM Products
WHERE product_id = $1;
- $1: `product_id` identifica univocamente un prodotto. 
→**Nota Bene**: Questa query  permette al sistema di recuperare i dati del prodotto necessari per i controlli successivi.

UPDATE Products
SET quantity = quantity - 1
WHERE product_id = $1
- `product_id` identifica univocamente un prodotto. 
→**Nota Bene**: Questa operazione viene eseguita solo se la colonna `quantity` del prodotto non è `NULL` (indipendentemente dal fatto che sia `physical` o  `digital`).

SELECT zip_code, city, street, street_number, apartment_floor
FROM Users
WHERE username = $1;
- $1: `username` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
→ **Nota Bene**: Questa query viene eseguita esclusivamente se il product è di tipo `physical`. Attraverso quest'ultima andiamo a verificare che il buyer abbia inserito un indirizzo di spedizione  valido e completo.

INSERT INTO Purchases  (username_vendor, username_buyer,  product_id)
VALUES ($1, $2, $3) ;

- $1 : `username_vendor`  del venditore.  Questo valore non viene inserito manualmente dallo `user` , ma viene estratto automaticamente dal sistema tramite il `product_id` a cui è associato il prodotto .
- $2 : `username_buyer` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $3 : `product_id` identifica univocamente un prodotto. 

---


# FOLLOWS

# /users/me/followers

## GET 

- GET  → Attraverso la GET si permette a uno user, autenticato, di ottenere la lista paginata  di tutte le persone che seguono un certo `vendor`. Questa  richiesta può essere fatta esclusivamente dai `vendor`.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da recuperare la sua specifica lista di followers.  È possibile filtrare i risultati per username utilizzando il  parametro opzionale di query `q` .

QUERY:
SELECT follower
FROM Follows
WHERE following=$1 AND follower ILIKE  $2 
LIMIT $3 OFFSET $4;

- $1 : username del `vendor`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2 : username delle persone che seguono un certo `vendor`.  Se utilizzato, permette di  filtrare tutti i risultati che contengono la stringa inserita.
- $3 : size` indica quanti risultati mostrare .
- $4 :`page` indica da quale riga partire .

# /users/me/followings

## GET 

- GET  → Attraverso  la GET si permette a uno user autenticato di ottenere la lista paginata  di tutti i `vendor` che  un certo `user` (sia lui stesso un vendor o uno user semplice)  segue.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da recuperare la sua specifica lista dei `vendor` seguiti. È possibile filtrare i risultati per username utilizzando il  parametro opzionale di query `q` .

QUERY :
SELECT following
FROM Follows
WHERE follower=$1 AND following ILIKE $2
LIMIT $3 OFFSET $4;

- $1 : username dello `user`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2 : username del `vendor` che ha seguito lo user loggato.  Se utilizzato, permette di  filtrare tutti i risultati che contengono la stringa inserita.
-  $3 : size` indica quanti risultati mostrare .
- $4 :`page` indica da quale riga partire .
## POST 

- POST  → Attraverso la POST si permette a uno user autenticato di poter iniziare a seguire un `vendor`. Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da aggiornare la sua specifica lista di `vendor` seguiti. Questa azione è eseguibile da un qualsiasi user, sia lui stesso un vendor o  uno user semplice. Non è concesso di poter seguire di nuovo  un `vendor` che  si sta già seguendo.  

QUERY:  
SELECT username
FROM Users
WHERE type = 'vendor' AND username = $1;

- `username`del vendor che si vuole  iniziare a seguire.
→ Questa query viene eseguita per verificare l'effettiva esistenza del vendor nel sistema.

INSERT INTO Follows(follower, following ) 
VALUES ($1, $2);
- $1 : username dello `user`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2 : username del `vendor` che si è iniziato a seguire. 

# /users/me/followings/:username_vendor

## DELETE

- DELETE  →Attraverso la DELETE si permette a uno user autenticato di poter smettere di seguire un certo `vendor`.  Il server effettua un controllo sul token, da cui estrae l'identità del richiedente, così da poter eliminare il  `vendor` dalla sua specifica lista di seguiti. Non è concesso  smettere di seguire un `vendor` che non si  stava già seguendo. 

QUERY:
DELETE  
FROM Follows
WHERE follower= $1 AND following = $2 ;

- $1 : username dello `user`  richiedente. Questo valore non viene inserito manualmente dallo user, ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2 : username del `vendor` che si vuole smettere di  seguire. 

--- 
# COLLEZIONE PRODUCT

# /products

## GET 

- GET → Attraverso la GET si permette a qualsiasi user (anche non loggato) di ottenere una risposta, paginata,  con la lista dei prodotti presenti nella collezione.  È inoltre possibile filtrare i prodotti cercati in base al loro nome, tramite il parametro di query `q`,  o al loro tipo (`physical`, `digital` ) tramite il parametro `type`.  

QUERY:

SELECT *
FROM Products
WHERE type= ANY($1) AND name ILIKE $2
LIMIT $3 OFFSET $4 ;`

- $1: `type`  del product . Se questo parametro viene specificato i risultati verranno filtrati solo  per un tipo specifico di prodotti ( physical, digital).
- $2 : `name` del product si può inserire per filtrare i prodotti per un certo nome .
- $3 : `size` indica quanti risultati mostrare .
- $4 :`page` indica da quale riga partire .

## POST

- **POST** → Attraverso la POST si permette a uno user autenticato l'inserimento di un nuovo prodotto nel catalogo. Questa azione è riservata esclusivamente agli utenti con profilo di `type`=`vendor`.  Attraverso il token di autenticazione il sistema identifica automaticamente il vendor che sta pubblicando il prodotto, evitando l'inserimento manuale dello `username_vendor`.  I campi `product_id` e `timestamp_put_on_sale` sono generati automaticamente dal sistema e non devono essere inclusi nella richiesta. Inoltre, il `vendor` non dovrà specificare il `type` del prodotto  poiché il sistema lo stabilirà automaticamente attraverso dei controlli sui campi inseriti.

QUERY:  
INSERT INTO Products  (name, description, quantity, price, type, byte, weight_in_kg, username_vendor)
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
# /products/:product_id

## GET

-  **GET** → Attraverso la GET si permette ad un qualsiasi  user (anche non loggato)  di poter ricercare un certo prodotto attraverso il suo `product_id`. 

QUERY :

SELECT *
FROM Products
WHERE product_id= $1 ;

- $1 : `product_id` identifica univocamente un prodotto. 

## PATCH

- **PATCH** → Attraverso la PATCH si permette ad un vendor  autenticato di poter modificare alcuni parametri dei suoi prodotti (`quantity`, `name`, `description`). Il server effettua un controllo sul token del richiedente per verificare che l'identità del venditore coincida con il proprietario del prodotto, impedendo modifiche non autorizzate su prodotti appartenenti ad altri `vendor`. Per avere una consistenza dei dati nello storico degli acquisti, una volta messo in vendita un prodotto, non verrà concessa la  modifica del `type` e degli attributi opzionali (`weight_in_kg`, `byte`) .

 Parametri del Body:
 (`quantity`, `name`, `description`)

QUERY:
UPDATE Products
SET quantity= $3, name= $4, description=$5
WHERE username_vendor= $1  AND product_id= $2
RETURNING * ; 

- $1 : `username_vendor ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.
- $2 : `product_id` del product.  Il prodotto deve appartenere alla lista dei prodotti messi in vendita dal `vendor` richiedente. 
- $3:  `quantity` di un determinato prodotto che può essere modificata.
- $4 :  `name` di un determinato prodotto che può essere modificata.
- $5 : `description` di un determinato prodotto che può essere modificata.

---

# IMMAGINI SINGOLO PRODOTTO
# /products/:product_id/ image

## GET

- **GET** → Attraverso la GET si permette ad uno user autenticato di poter richiedere, di un prodotto,  una specifica immagine. Il server effettua un controllo sul token del richiedente da cui estrae la sua identità. Una volta fatto ciò la risposta che verrà ritornata sarà l'immagine profilo 

QUERY:
SELECT image_url
FROM products
WHERE product_id = $1;

- $1 : `product_id` identifica univocamente un prodotto. 
## POST 

-  **POST** → Attraverso la POST si permette ad un vendor, autenticato e proprietario di un certo prodotto, di poter pubblicare  una nuova immagine per il proprio prodotto.  Il proprietario del prodotto viene estratto tramite il `product_id`.

QUERY: 
UPDATE products
SET image_url = $1
WHERE product_id = $2
AND username_vendor = $3;

- $1: `image_url ` è  la stringa contenente il percorso del server (`path`) in cui è stato salvato fisicamente il file.
- $2 : identifica univocamente un prodotto. 
- $3:  `username_vendor ` del richiedente. Questo valore non viene inserito manualmente dallo `user`,  ma viene estratto automaticamente dal sistema tramite il token di autenticazione.

--- 
