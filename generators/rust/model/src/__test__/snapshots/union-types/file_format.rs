use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FileFormat {
    JSON,
    #[serde(rename = "CSV")]
    Csv,
    XML,
    #[serde(rename = "YAML")]
    Yaml,
}