``` json
CREATE TABLE Users (
    username VARCHAR(20) PRIMARY KEY,
    mail VARCHAR(40) NOT NULL UNIQUE,
    password CHAR(60) NOT NULL,
    type VARCHAR(10) NOT NULL DEFAULT 'user',
    zip_code CHAR(5),
    city VARCHAR(15),
    street VARCHAR(25),
    street_number NUMERIC(3,0),
    apartment_floor NUMERIC(3,0), 
    VAT_NUMBER CHAR(15) UNIQUE ,
    image_url VARCHAR(255),
    session_id CHAR(29)
);
CREATE TABLE Products (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    timestamp_put_on_sale TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(50) NOT NULL,
    quantity INT, 
    price DECIMAL(10,2) NOT NULL CHECK (price>=0), 
    description VARCHAR(200) NOT NULL,
    username_vendor VARCHAR(20) NOT NULL, 
    image_url VARCHAR(255), 
    type VARCHAR(10) NOT NULL CHECK (type IN ('digital', 'physical')),
    byte BIGINT, -- Popolato solo se digitale
    weight_in_kg DECIMAL(5,2) -- Popolato solo se fisico
);
CREATE TABLE Purchases (
    timestamp_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username_vendor VARCHAR(20) NOT NULL, 
	 username_buyer VARCHAR(20) NOT NULL, 
    product_id INT NOT NULL,
    
    PRIMARY KEY (timestamp_transaction, username_vendor, username_buyer, product_id),
    FOREIGN KEY (username_vendor) REFERENCES Users(username), 
	FOREIGN KEY (username_buyer) REFERENCES Users(username),
    FOREIGN KEY (product_id) REFERENCES Products(product_id) 
        ON DELETE RESTRICT      
);
CREATE TABLE Follows (
    follower VARCHAR(20) NOT NULL, -- username chi segue  
    following VARCHAR(20) NOT NULL, -- username chi viene seguito
    
    PRIMARY KEY (follower, following),
    
    FOREIGN KEY (follower) REFERENCES Users(username), 
    FOREIGN KEY (following) REFERENCES Users(username) 
);

```
