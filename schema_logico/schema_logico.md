Nome, Cognome: Rebecca Fulginiti 
Matricola : 26182A

## Progettazione logica (Modello Relazionale)
Legenda: __chiave primaria__, *chiave esterna*, **attributi unici**, --permette null--

* Users(__username__, **mail**, password, --zip_code--, --city--, --street--, --street_number--, --apartment_floor--, type, --VAT_number--, --image_url--, --session_id--)
* Products(__product_id__, timestamp_put_on_sale, name, --quantity--, price, description, type, *username_vendor*, --byte--, --weight_in_kg--)
  » * foreign key (username_vendor) references Users (username)
* Purchases(__*username_vendor*__, __*username_buyer*__, __*product_id*__, __timestamp_transaction__)
  » * foreign key (username_vendor) references Users (username)
  » * foreign key (username_buyer) references Users (username)
  » * foreign key (product_id) references Products (product_id)
* Follows(__*follower*__, __*following*__)
  » * foreign key (follower) references Users (username)
  » * foreign key (following) references Users (username)