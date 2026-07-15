Nome, Cognome: Rebecca Fulginiti 
Matricola : 26182A

  

**RIDONDANZE**

- L'unica ridondanza dello schema è l'attributo price nella tabella Purchase. Si tratta di una ridondanza perché lo stesso identico valore è già presente nella tabella Product, quindi il prezzo dell'acquisto potrebbe essere recuperato in qualsiasi momento incrociando i dati delle due tabelle tramite il product_id. Non c’è problema  di inconsistenza dei dati poichè il venditore non può cambiare il prezzo del prodotto quindi nel tempo il prezzo risulterà sempre lo stesso.



**ELIMINAZIONE DELLE GENERALIZZAZIONI**

- I tipi di prodotto, DIGITAL e PHYSICAL, sono stati accorpati nel padre PRODUCT facendo in modo che i due attributi divengono opzionali visto che la generalizzazione è totale e non ci sono associazioni che coinvolgono soltanto le entità figlie (si introduce il vincolo aggiuntivo di presenza obbligatoria  che il prodotto sia fisico o digitale).

  
- Si è scelto di accorpare il tipo VENDOR nel padre USER facendo in modo che l'attributo VAT_NUMBER diventi opzionale visto che la generalizzazione è parziale e non ci sono associazioni che coinvolgono soltanto l'entità figlia (si introduce il vincolo aggiuntivo che se l'attributo type è impostato su 'vendor' la partita IVA sia obbligatoria).

  

**ELIMINAZIONE ATTRIBUTI COMPOSTI E MULTIVALORE** 

-   L'attributo composto address dello schema concettuale è stato rimosso e suddiviso nei suoi componenti atomici (zip_code, city, street, street_number, apartment_floor) nella tabella USER.

  
**SCELTE DEGLI IDENTIFICATORI PRINCIPALI** 

- **USER**: Per identificare uno USER si conferma il suo username in quanto univoco

- **PRODUCT**: Per identificare un PRODUCT si genera progressivamente un ID univoco. Questo evita di dover creare una chiave composta usando i vari dati del prodotto (name,decsription,type,timestamp_put_on_sale) con la foreign key del venditore. 


- **PURCHASE:**   Per identificare un PURCHASE viene utilizzata una chiave composta formata da :
	- username del venditore
	- product_id
	- timestamp della transazione 
	
 —>  Questa combinazione garantisce l’univocità di ogni acquisto. Il prezzo viene volutamente escluso dalla chiave dato dal fatto che è un semplice attributo descrittivo che si può ricavare dalla tabella PRODUCT.