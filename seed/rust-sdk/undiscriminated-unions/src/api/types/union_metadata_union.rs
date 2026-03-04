pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MetadataUnion {
    OptionalMetadata(OptionalMetadata),

    NamedMetadata(NamedMetadata),
}

impl MetadataUnion {
    pub fn is_optionalmetadata(&self) -> bool {
        matches!(self, Self::OptionalMetadata(_))
    }

    pub fn is_namedmetadata(&self) -> bool {
        matches!(self, Self::NamedMetadata(_))
    }

    pub fn as_optionalmetadata(&self) -> Option<&OptionalMetadata> {
        match self {
            Self::OptionalMetadata(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_optionalmetadata(self) -> Option<OptionalMetadata> {
        match self {
            Self::OptionalMetadata(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_namedmetadata(&self) -> Option<&NamedMetadata> {
        match self {
            Self::NamedMetadata(value) => Some(value),
            _ => None,
        }
    }

    pub fn into_namedmetadata(self) -> Option<NamedMetadata> {
        match self {
            Self::NamedMetadata(value) => Some(value),
            _ => None,
        }
    }
}

impl fmt::Display for MetadataUnion {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::OptionalMetadata(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
            Self::NamedMetadata(value) => write!(
                f,
                "{}",
                serde_json::to_string(value).unwrap_or_else(|_| format!("{:?}", value))
            ),
        }
    }
}
