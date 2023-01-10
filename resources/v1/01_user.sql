CREATE TABLE IF NOT EXISTS user (
  id INT NOT NULL,
  first_name VARCHAR(45) NULL,
  last_name VARCHAR(45) NULL,
  email VARCHAR(45) NULL,
  mobile BIGINT(10) NULL,
  password VARCHAR(100) NULL,
  type_of_user ENUM('DRIVER', 'CUSTOMER') NULL,
  date_of_birth DATE NULL,
  city VARCHAR(20) NULL,
  location POINT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE,
  UNIQUE INDEX mobile_UNIQUE (mobile ASC) VISIBLE)
ENGINE = InnoDB