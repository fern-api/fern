pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TypesFileFormat {
    JSON,
    #[serde(rename = "CSV")]
    Csv,
    XML,
    #[serde(rename = "YAML")]
    Yaml,
}
impl fmt::Display for TypesFileFormat {
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
