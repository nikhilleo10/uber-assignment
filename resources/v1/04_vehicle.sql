CREATE TABLE IF NOT EXISTS vehicle (
  id INT NOT NULL AUTO_INCREMENT,
  brand VARCHAR(45) NOT NULL,
  color VARCHAR(45) NULL,
  vehicle_no VARCHAR(45) NOT NULL,
  type ENUM('CAR', 'BIKE', 'AUTO') NOT NULL,
  max_capacity INT NOT NULL,
  engine_type ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'CNG') NOT NULL,
  insurance_no VARCHAR(45) NOT NULL,
  insurance_exp DATE NOT NULL,
  driver_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX driver_id_idx (driver_id ASC) VISIBLE,
  CONSTRAINT driver_id_veh
    FOREIGN KEY (driver_id)
    REFERENCES driver (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB