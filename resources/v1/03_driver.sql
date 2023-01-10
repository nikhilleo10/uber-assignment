CREATE TABLE IF NOT EXISTS driver (
  id INT NOT NULL AUTO_INCREMENT,
  dl_no VARCHAR(45) NOT NULL,
  dl_expiry DATE NOT NULL,
  average_rating FLOAT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX user_id_idx (user_id ASC) VISIBLE,
  CONSTRAINT user_id_dri
    FOREIGN KEY (user_id)
    REFERENCES user (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB