use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "vehicle_type")]
pub enum Vehicle {
        Car {
            #[serde(flatten)]
            data: Car,
            id: String,
            manufacturer: String,
            year: i32,
        },

        Motorcycle {
            #[serde(flatten)]
            data: Motorcycle,
            id: String,
            manufacturer: String,
            year: i32,
        },

        Truck {
            #[serde(flatten)]
            data: Truck,
            id: String,
            manufacturer: String,
            year: i32,
        },
}

impl Vehicle {
    pub fn get_id(&self) -> &String {
        match self {
                    Self::Car { id, .. } => id,
                    Self::Motorcycle { id, .. } => id,
                    Self::Truck { id, .. } => id,
                }
    }

    pub fn get_manufacturer(&self) -> &String {
        match self {
                    Self::Car { manufacturer, .. } => manufacturer,
                    Self::Motorcycle { manufacturer, .. } => manufacturer,
                    Self::Truck { manufacturer, .. } => manufacturer,
                }
    }

    pub fn get_year(&self) -> &i32 {
        match self {
                    Self::Car { year, .. } => year,
                    Self::Motorcycle { year, .. } => year,
                    Self::Truck { year, .. } => year,
                }
    }

}
