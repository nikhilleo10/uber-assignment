CREATE TABLE IF NOT EXISTS incomplete_rides (
  id INT NOT NULL AUTO_INCREMENT,
  cancellation_time TIMESTAMP NOT NULL,
  reason_for_cancellation VARCHAR(45) NOT NULL,
  trip_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX trip_id_idx (trip_id ASC) VISIBLE,
  CONSTRAINT trip_id_inc
    FOREIGN KEY (trip_id)
    REFERENCES requested_rides (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB