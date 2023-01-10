CREATE TABLE IF NOT EXISTS completed_rides (
  id INT NOT NULL,
  pickup_time VARCHAR(45) NULL,
  dropoff_time VARCHAR(45) NULL,
  duration_travelled FLOAT NULL,
  actual_fare FLOAT NULL,
  tip FLOAT NULL,
  trip_id INT NULL,
  PRIMARY KEY (id),
  INDEX trip_id_idx (trip_id ASC) VISIBLE,
  CONSTRAINT trip_id_com
    FOREIGN KEY (trip_id)
    REFERENCES requested_rides (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB