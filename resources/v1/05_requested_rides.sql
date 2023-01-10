CREATE TABLE IF NOT EXISTS requested_rides (
  id INT NOT NULL,
  pickup_loc VARCHAR(45) NULL,
  drop_loc VARCHAR(45) NULL,
  date_of_ride DATE NULL,
  est_fare FLOAT NULL,
  est_distance FLOAT NULL,
  cust_id INT NULL,
  driver_id INT NULL,
  PRIMARY KEY (id),
  INDEX driver_id_idx (driver_id ASC) VISIBLE,
  INDEX cust_id_idx (cust_id ASC) VISIBLE,
  CONSTRAINT driver_id_req_rides
    FOREIGN KEY (driver_id)
    REFERENCES driver (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT cust_id_req_rides
    FOREIGN KEY (cust_id)
    REFERENCES customer (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB