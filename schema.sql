CREATE TABLE IF NOT EXISTS User (
  facebookId      BIGINT(64) UNSIGNED,
  email           VARCHAR(255),
  firstName       VARCHAR(255),
  lastName        VARCHAR(255),
  CONSTRAINT User_pk PRIMARY KEY(facebookId)
);

CREATE TABLE IF NOT EXISTS Product (
  upc             BIGINT(64) UNSIGNED,
  name            VARCHAR(255) NOT NULL,
  CONSTRAINT Product_pk PRIMARY KEY(upc)
);

CREATE TABLE IF NOT EXISTS Review (
  id              INT NOT NULL AUTO_INCREMENT,
  CONSTRAINT Review_pk PRIMARY KEY(id),
  
  User_facebookId BIGINT(64) UNSIGNED,
  FOREIGN KEY (User_facebookId) REFERENCES User(facebookId),

  comment         TEXT,
  rating          TINYINT(1) UNSIGNED,

  CONSTRAINT Review_unique UNIQUE KEY(User_facebookId)
);

CREATE TABLE IF NOT EXISTS Image (
  url             VARCHAR(255) NOT NULL,
  
  User_facebookId BIGINT(64) UNSIGNED,
  CONSTRAINT Image_fk_facebookId FOREIGN KEY(User_facebookId) 
  REFERENCES User(facebookId),

  Product_upc     BIGINT(64) UNSIGNED,
  CONSTRAINT Image_fk_upc FOREIGN KEY(Product_upc) 
  REFERENCES Product(upc),

  CONSTRAINT Image_pk PRIMARY KEY(url)

);



CREATE TABLE IF NOT EXISTS Vote (
  Review_id       INT NOT NULL,
  CONSTRAINT Vote_fk_Review_id FOREIGN KEY(Review_id)
  REFERENCES Review(id),

  score           TINYINT(1) NOT NULL,
  -- CONSTRAINT Vote_score CHECK (score IN (1, 0, -1)),

  User_facebookId BIGINT(64) UNSIGNED,
  CONSTRAINT Vote_fk_User_facebookId FOREIGN KEY(User_facebookId)
  REFERENCES User(facebookId),

  CONSTRAINT Vote_pk PRIMARY KEY (Review_id, User_facebookId),


);