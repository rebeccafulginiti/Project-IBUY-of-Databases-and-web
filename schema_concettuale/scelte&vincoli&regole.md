Nome, Cognome: Rebecca Fulginiti 

Matricola : 26182A

### **SCELTE PROGETTUALI**   

- **Scelta chiave Purchase:** La chiave primaria della tabella Purchase è una chiave composta dalla terna ( timestamp_transaction, username_vendor, username_buyer, product_id). Questa scelta garantisce l'unicità di ogni singola transazione, impedendo che lo stesso utente possa effettuare contemporaneamente più acquisti dello stesso identico prodotto.

- **Scelta chiave User:** La chiave primaria scelta per l'identificazione degli utenti è l'attributo username.  Al fine di garantire che non esistano due profili associati alla medesima mail, si è scelto di modellare l’attributo mail come chiave alternativa. Tale attributo non può essere modificato dopo la registrazione per mantenere la consistenza è integrità dei dati.    

- **Utilizzo del sessionID**: Per identificare gli utenti loggati viene utilizzato un approccio a sessioni. Lo stato del login viene tracciato semplicemente aggiornando il campo sessionID all'interno della tabella users.

- **Aggiunta attributi nell’address:** Rispetto alle specifiche fornite, si è scelto di estendere e definire l'indirizzo dell'utente inserendo nel sistema attributi atomici specifici (zip_code, city, street, street_number, apartment_floor). Questa scelta permette di gestire in modo più preciso e completo le reali necessità logistiche di spedizione.

- **Caratterizzazione dei prodotti:** I prodotti sono stati divisi in base al loro contenuto : digitale o fisico ( devono  obbligatoriamente rientrare in una delle due categorie ).

- **Quantità e disponibilità dei prodotti:**  Per l’attributo quantity,  situato nella tabella Product, si è scelto  di ammettere il valore NULL  poiché se non viene specificato un valore si considera la quantità del prodotto come illimitata.  

- **Immutabilità del prezzo dei prodotti:** Per evitare inconsistenze nei dati e non dover gestire una tabella aggiuntiva per lo storico dei prezzi, si è scelto di rendere il prezzo di un prodotto **non modificabile**. Facendo ciò si garantisce l'integrità e la coerenza dei dati storici delle transazioni nella tabella Purchase.
  

## **VINCOLI AGGIUNTIVI** 

- **Dimensione massima file:** Le immagini del profilo e dei prodotti caricate dagli utenti non possono superare la dimensione massima di 100kb.

- **Vincolo di auto-follow:** Uno user non può seguire se stesso. La tabella che gestisce i follow deve impedire l'inserimento di un record dove l'ID di chi segue coincide con l'ID di chi è seguito.

- **Unicità del follow:** Uno user non può seguire due volte lo stesso vendor.

- **Obbligatorietà dell’indirizzo:**  Il sistema gestisce l'acquisto in modo diverso in base al tipo di prodotto. Per i prodotti digitali, lo user può completare l'acquisto anche se non ha inserito un indirizzo nel proprio profilo. Per i prodotti fisici , invece, risulta obbligatorio avere un indirizzo di consegna valido nel profilo per poter gestire la spedizione. 

- **Blocco auto-acquisto:** Un vendor non può acquistare un prodotto inserito da lui stesso. Il sistema verifica l'operazione e  la blocca nel caso in cui  lo username di chi compra coincida con lo username del proprietario del prodotto.

- **Modifica  del prodotto riservata al venditore:** L'aggiornamento dei dati di un prodotto può essere effettuato esclusivamente dal vendor stesso di quel prodotto. Viene verificata l'identità dell'utente prima di autorizzare qualsiasi modifica.  

- **Ricerca senza autenticazione:** Lo user non deve essere loggato per effettuare la ricerca dei prodotti.  Tutte le altre azioni (inserimento prodotti, acquisti, follow) richiedono  obbligatoriamente una sessione attiva.

- **Aggiunta del username_buyer nella Purchase :** Quando viene registrato un acquisto il sistema deve salvare anche lo username dello user che sta effettuando l'acquisto.  Questa informazione non può essere inserita manualmente ma viene ricavata estraendo l'identità del buyer tramite il token di autenticazione.

- **Asimmetria delle relazioni di Follow:** Nel sistema solo i Vendor possono essere seguiti. Di conseguenza:
	1.  Uno user può richiedere solo la lista dei propri _following_ (chi segue).
	2. I  Vendor possono richiedere anche la lista dei propri following, come gli user, ma in più sono in grado di visualizzare e richiedere la lista dei propri _follower_.

 - **Unicità del VAT_NUMBER** : Nel sistema non ci possono essere più vendor che utilizzano lo stesso numero di partita IVA. 

## **REGOLE DI DERIVAZIONE/FLUSSO** 

- **Passaggio da user a vendor:** Il sistema permette a un utente standard di evolvere il proprio profilo in un account venditore. Questa transizione è vincolata dall'inserimento di un numero di partita IVA valido (VAT_NUMBER) che comporterà anche un cambiamento del type da 'user' a 'vendor'. 

- **Calcolo del costo di acquisto:** Nel momento in cui viene effettuato un acquisto,  in base alla tipologia del prodotto viene calcolato il costo totale. Per i prodotti digitali il costo corrisponde esattamente al prezzo del prodotto. Per i prodotti fisici, invece, al prezzo viene sommato il valore del peso come contributo per le spese di spedizione.