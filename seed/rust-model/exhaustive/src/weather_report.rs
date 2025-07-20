use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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