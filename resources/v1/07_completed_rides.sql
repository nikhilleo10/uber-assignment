CREATE TABLE IF NOT EXISTS completed_rides (
  id INT NOT NULL AUTO_INCREMENT,
  pickup_time DATETIME NOT NULL,
  dropoff_time DATETIME NULL,
  duration_travelled FLOAT NULL,
  actual_fare FLOAT NULL,
  tip FLOAT NULL,
  trip_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX trip_id_idx (trip_id ASC) VISIBLE,
  CONSTRAINT trip_id_com
    FOREIGN KEY (trip_id)
    REFERENCES requested_rides (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB