Nome, Cognome: Rebecca Fulginiti 
Matricola : 26182A

## Progettazione logica (Modello Relazionale)
Legenda: __chiave primaria__, *chiave esterna*, **attributi unici**, --permette null--

* Users(__username__, **mail**, password, --zip_code--, --city--, --street--, --street_number--, --apartment_floor--, --session_id--)
* Vendors(__*username_vendor*__, **VAT_NUMBER**)
» * foreign key (username_vendor) references Users (username)
* Products(__product_id__, timestamp_put_on_sale, name, --quantity--, price, description, type, *username_vendor*, --byte--, --weight_in_kg--)
  » * foreign key (username_vendor) references Vendors(username_vendor)
* Purchases(__purchase_id__ ,*username_buyer*, *product_id*, timestamp_transaction)
  » * foreign key (username_buyer) references Users (username)
  » * foreign key (product_id) references Products (product_id)
* Follows(__*follower*__, __*following*__)
  » * foreign key (follower) references Users (username)
  » * foreign key (following) references Vendors (username_vendor)