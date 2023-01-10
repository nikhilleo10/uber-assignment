CREATE TABLE IF NOT EXISTS customer (
  id INT NOT NULL,
  type ENUM('REGULAR', 'PREMIUM') NULL,
  user_id INT NULL,
  PRIMARY KEY (id),
  INDEX user_id_idx (user_id ASC) VISIBLE,
  CONSTRAINT user_id_cust
    FOREIGN KEY (user_id)
    REFERENCES user(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB