CREATE TABLE cart_storage (
    name TEXT PRIMARY KEY,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0)
);