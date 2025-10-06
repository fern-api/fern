pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "vehicle_type")]
pub enum TypesVehicle {
        Car {
            #[serde(flatten)]
            data: TypesCar,
            id: String,
            manufacturer: String,
            year: i64,
        },

        Motorcycle {
            #[serde(flatten)]
            data: TypesMotorcycle,
            id: String,
            manufacturer: String,
            year: i64,
        },

        Truck {
            #[serde(flatten)]
            data: TypesTruck,
            id: String,
            manufacturer: String,
            year: i64,
        },
}

impl TypesVehicle {
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

    pub fn get_year(&self) -> &i64 {
        match self {
                    Self::Car { year, .. } => year,
                    Self::Motorcycle { year, .. } => year,
                    Self::Truck { year, .. } => year,
                }
    }

}
