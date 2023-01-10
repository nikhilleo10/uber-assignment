CREATE TABLE IF NOT EXISTS vehicle (
  id INT NOT NULL,
  brand VARCHAR(45) NULL,
  color VARCHAR(45) NULL,
  vehicle_no VARCHAR(45) NULL,
  type ENUM('CAR', 'BIKE', 'AUTO') NULL,
  max_capacity INT NULL,
  engine_type ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'CNG') NULL,
  insurance_no VARCHAR(45) NULL,
  insurance_exp DATE NULL,
  driver_id INT NULL,
  PRIMARY KEY (id),
  INDEX driver_id_idx (driver_id ASC) VISIBLE,
  CONSTRAINT driver_id_veh
    FOREIGN KEY (driver_id)
    REFERENCES driver (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB