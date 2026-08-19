use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum FileFormat {
    JSON,
    #[serde(rename = "CSV")]
    Csv,
    XML,
    #[serde(rename = "YAML")]
    Yaml,
}
impl fmt::Display for FileFormat {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let s = match self {
            Self::JSON => "JSON",
            Self::Csv => "CSV",
            Self::XML => "XML",
            Self::Yaml => "YAML",
        };
        write!(f, "{}", s)
    }
}
