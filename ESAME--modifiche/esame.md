Nome, Cognome: Rebecca Fulginiti 

Matricola : 26182A

### **SCELTE PROGETTUALI**   


## **VINCOLI AGGIUNTIVI** 


## **REGOLE DI DERIVAZIONE/FLUSSO** 


**RIDONDANZE**


**ELIMINAZIONE DELLE GENERALIZZAZIONI**

  
**ELIMINAZIONE ATTRIBUTI COMPOSTI E MULTIVALORE** 

  
**SCELTE DEGLI IDENTIFICATORI PRINCIPALI** 


## Progettazione logica (Modello Relazionale)
Legenda: __chiave primaria__, *chiave esterna*, **attributi unici**, --permette null--

* Users(__username__, **mail**, password, --zip_code--, --city--, --street--, --street_number--, --apartment_floor--, --image_url--, --session_id--)
* Vendors(__username_vendor__, **VAT_NUMBER**)
» * foreign key (username_vendor) references Users (username)
* Products(__product_id__, timestamp_put_on_sale, name, --quantity--, price, description, type, *username_vendor*, --byte--, --weight_in_kg--)
  » * foreign key (username_vendor) references Vendors(username_vendor)
* Purchases(__purchase_id__ ,*username_buyer*, *product_id*, timestamp_transaction)
  » * foreign key (username_buyer) references Users (username)
  » * foreign key (product_id) references Products (product_id)
* Follows(__*follower*__, __*following*__)
  » * foreign key (follower) references Users (username)
  » * foreign key (following) references Vendors (username_vendor)



## NUOVE API REST E QUERY SQL 

