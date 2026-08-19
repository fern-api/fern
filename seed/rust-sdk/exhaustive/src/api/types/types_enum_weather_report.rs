pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum WeatherReport {
    Sunny,
    Cloudy,
    Raining,
    Snowing,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for WeatherReport {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Sunny => serializer.serialize_str("SUNNY"),
            Self::Cloudy => serializer.serialize_str("CLOUDY"),
            Self::Raining => serializer.serialize_str("RAINING"),
            Self::Snowing => serializer.serialize_str("SNOWING"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for WeatherReport {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "SUNNY" => Ok(Self::Sunny),
            "CLOUDY" => Ok(Self::Cloudy),
            "RAINING" => Ok(Self::Raining),
            "SNOWING" => Ok(Self::Snowing),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for WeatherReport {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Sunny => write!(f, "SUNNY"),
            Self::Cloudy => write!(f, "CLOUDY"),
            Self::Raining => write!(f, "RAINING"),
            Self::Snowing => write!(f, "SNOWING"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
