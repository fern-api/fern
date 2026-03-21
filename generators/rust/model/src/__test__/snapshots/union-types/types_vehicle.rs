pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "vehicle_type")]
pub enum Vehicle {
        #[serde(rename = "car")]
        #[non_exhaustive]
        Car {
            #[serde(default)]
            doors: i64,
            #[serde(default)]
            fuel_type: String,
            id: String,
            manufacturer: String,
            year: i64,
        },

        #[serde(rename = "motorcycle")]
        #[non_exhaustive]
        Motorcycle {
            #[serde(default)]
            engine_size: f64,
            #[serde(default)]
            has_sidecar: bool,
            id: String,
            manufacturer: String,
            year: i64,
        },

        #[serde(rename = "truck")]
        #[non_exhaustive]
        Truck {
            #[serde(default)]
            payload_capacity: f64,
            #[serde(default)]
            axles: i64,
            id: String,
            manufacturer: String,
            year: i64,
        },
}

impl Vehicle {
    pub fn car(doors: i64, fuel_type: String, id: String, manufacturer: String, year: i64) -> Self {
        Self::Car { doors, fuel_type, id, manufacturer, year }
    }

    pub fn motorcycle(engine_size: f64, has_sidecar: bool, id: String, manufacturer: String, year: i64) -> Self {
        Self::Motorcycle { engine_size, has_sidecar, id, manufacturer, year }
    }

    pub fn truck(payload_capacity: f64, axles: i64, id: String, manufacturer: String, year: i64) -> Self {
        Self::Truck { payload_capacity, axles, id, manufacturer, year }
    }

    pub fn get_id(&self) -> &str {
        match self {
                    Self::Car { id, .. } => id,
                    Self::Motorcycle { id, .. } => id,
                    Self::Truck { id, .. } => id,
                }
    }

    pub fn get_manufacturer(&self) -> &str {
        match self {
                    Self::Car { manufacturer, .. } => manufacturer,
                    Self::Motorcycle { manufacturer, .. } => manufacturer,
                    Self::Truck { manufacturer, .. } => manufacturer,
                }
    }

    pub fn get_year(&self) -> &i64 {
        match self {
                    Self::Car { year, .. } => year,
                    Self::Motorcycle { year, .. } => year,
                    Self::Truck { year, .. } => year,
                }
    }
}
