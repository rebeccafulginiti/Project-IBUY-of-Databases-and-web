LA PASSWORD é "ciao"

```sql 
INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'bettinz',
'superbettinz@libero.it',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'vendor',
'20021',
'Milano',
'Lattea',
25,
12,
'IT0012345678901',
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'rebecca',
'rebecca.rossi@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'user',
'20121',
'Milano',
'Duomo',
14,
3,
NULL,
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'filippo',
'filippo.bianchi@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'user',
'00184',
'Roma',
'Cavour',
102,
1,
NULL,
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'dragan',
'dragan.v@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'vendor',
'10121',
'Torino',
'Garibaldi',
5,
NULL,
'IT0098765432109',
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'elena',
'elena.verdi@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'user',
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL,
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'giorgia',
'giorgia.shop@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'vendor',
'23456',
'Parabiago',
'Marconi',
32,
123,
'IT0033344455566',
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'giorgia_style',
'info@giorgiastyle.it',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'vendor',
'20122',
'Milano',
'Torino',
54,
2,
'IT0077788899900',
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'wiktor',
'wiktor.tech@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'vendor',
'10123',
'Torino',
'Po',
11,
4,
'IT0012121212121',
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'davide',
'davide.azzurri@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'user',
'50121',
'Firenze',
'Ricasoli',
3,
1,
NULL,
'https://example.com',
NULL
);

INSERT INTO Users (username, mail, password, type, zip_code, city, street, street_number, apartment_floor, VAT_NUMBER, image_url, session_id)
VALUES (
'marta',
'marta.rossi@mail.com',
'$2a$10$E8zPuCtr3/.QDD8KNw5Xm.9Ag9LoYcjuiBD0E5jaWnC5HFyE4ELMy',
'user',
'80131',
'Napoli',
'Toledo',
142,
5,
NULL,
'https://example.com',
NULL
);



INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Spider-Man No Way Home AF', 2, 129.99, 'Action figure da collezione in scala 1:6 di Peter Parker. Dettagli ultra realistici in tessuto.', 'dragan', NULL, 'physical', NULL, 1.20);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Mjolnir in Acciaio', 3, 249.99, 'Replica 1:1 del martello di Thor. Nota: pesa quasi 4kg, assicurati di essere degno prima dell''acquisto.', 'dragan', NULL, 'physical', NULL, 3.80);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Felpa reattore Arc', 15, 49.99, 'Felpa con reattore Arc ricamato sul petto. Non ti protegge dalle gemme dell''infinito ma tiene caldo.', 'dragan', NULL, 'physical', NULL, 0.65);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Sfondi Digitali Asgard 8K', NULL, 1.99, 'Set di 5 sfondi digitali mozzafiato ad altissima risoluzione dedicati ai paesaggi di Asgard.', 'dragan', NULL, 'digital', 85000000, NULL);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Scheda MicroSD 128GB', 35, 24.90, 'Scheda di memoria MicroSDXC ad alta velocità, classe 10, ideale per smartphone, fotocamere e tablet.', 'wiktor', NULL, 'physical', NULL, 0.01);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Mouse Wireless Ergonomico', 12, 34.99, 'Mouse senza fili ricaricabile con sensore ottico ad alta precisione e tasti laterali programmabili.', 'wiktor', NULL, 'physical', NULL, 0.15);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Manuale C++ in PDF', NULL, 19.90, 'Ebook completo in formato PDF per imparare le basi della programmazione orientata agli oggetti.', 'wiktor', NULL, 'digital', 15400000, NULL);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Guida a HTML come Linguaggio', NULL, 4.99, 'Manuale ironico su come farsi odiare nella chat di lavoro spacciando l''HTML per vera programmazione.', 'bettinz', NULL, 'digital', 2048500, NULL);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Guida Avanzata per Uscire da Vim', NULL, 0.99, 'Un PDF salvavita focalizzato sull''unica vera domanda irrisolta dell''informatica: come diavolo si esce da Vim.', 'bettinz', NULL, 'digital', 850000, NULL);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Wall Art Git In Case of Fire', NULL, 2.50, 'Poster digitale ad alta risoluzione: In case of fire: git commit, git push, leave building.', 'bettinz', NULL, 'digital', 12500000, NULL);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('The Tortured Poets Department LP', 20, 39.99, 'Il vinile originale dell''album di Taylor Swift. Edizione limitata da collezione.', 'giorgia', NULL, 'physical', NULL, 0.40);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('Pack 5 Friendship Bracelets', 50, 12.00, 'I famosi braccialetti dell''amicizia ispirati alle varie "Eras" di Taylor Swift. Fatti a mano.', 'giorgia', NULL, 'physical', NULL, 0.05);

INSERT INTO Products (name, quantity, price, description, username_vendor, image_url, type, byte, weight_in_kg)
VALUES ('T-Shirt CSS Tower of Pisa', 25, 22.00, 'Maglietta con la torre di Pisa racchiusa in un box CSS scombinato che esce fuori dai bordi (overflow: visible).', 'giorgia_style', NULL, 'physical', NULL, 0.20);

INSERT INTO Purchases (username_vendor, username_buyer, product_id) VALUES
('giorgia', 'rebecca', 11),
('wiktor', 'rebecca', 6),
('giorgia', 'filippo', 11),
('bettinz', 'rebecca', 9),
('wiktor', 'dragan', 6),
('dragan', 'elena', 4),
('giorgia', 'marta', 11),
('bettinz', 'filippo', 9),
('giorgia_style', 'marta', 13),
('wiktor', 'elena', 7),
('giorgia', 'elena', 12),
('bettinz', 'davide', 10),
('dragan', 'filippo', 1);

INSERT INTO Follows (follower, following) VALUES
('rebecca', 'giorgia'),
('rebecca', 'dragan'),
('filippo', 'dragan'),
('filippo', 'bettinz'),
('elena', 'giorgia_style'),
('elena', 'wiktor'),
('marta', 'bettinz'),
('davide', 'wiktor'),
('dragan', 'wiktor'),
('wiktor', 'bettinz'),
('bettinz', 'giorgia'),
('giorgia', 'giorgia_style'),
('giorgia_style', 'dragan');
```