use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum WeatherReport {
    #[serde(rename = "SUNNY")]
    Sunny,
    #[serde(rename = "CLOUDY")]
    Cloudy,
    #[serde(rename = "RAINING")]
    Raining,
    #[serde(rename = "SNOWING")]
    Snowing,
}
impl fmt::Display for WeatherReport {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::Sunny => "SUNNY",
            Self::Cloudy => "CLOUDY",
            Self::Raining => "RAINING",
            Self::Snowing => "SNOWING",
        };
        write!(f, "{}", s)
    }
}
