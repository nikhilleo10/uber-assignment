CREATE TABLE IF NOT EXISTS driver (
  id INT NOT NULL,
  dl_no VARCHAR(45) NULL,
  dl_expiry DATE NULL,
  average_rating FLOAT NULL,
  user_id INT NULL,
  PRIMARY KEY (id),
  INDEX user_id_idx (user_id ASC) VISIBLE,
  CONSTRAINT user_id_dri
    FOREIGN KEY (user_id)
    REFERENCES user (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB