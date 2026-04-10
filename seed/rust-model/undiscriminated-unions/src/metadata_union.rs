pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum MetadataUnion {
        OptionalOptionalMetadata(Option<OptionalMetadata>),

        NamedMetadata(NamedMetadata),
}

impl MetadataUnion {
    pub fn is_optional_optional_metadata(&self) -> bool {
        matches!(self, Self::OptionalOptionalMetadata(_))
    }

    pub fn is_named_metadata(&self) -> bool {
        matches!(self, Self::NamedMetadata(_))
    }


    pub fn as_optional_optional_metadata(&self) -> Option<&OptionalMetadata> {
        match self {
                    Self::OptionalOptionalMetadata(value) => value.as_ref(),
                    _ => None,
                }
    }

    pub fn into_optional_optional_metadata(self) -> Option<OptionalMetadata> {
        match self {
                    Self::OptionalOptionalMetadata(value) => value,
                    _ => None,
                }
    }

    pub fn as_named_metadata(&self) -> Option<&NamedMetadata> {
        match self {
                    Self::NamedMetadata(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_named_metadata(self) -> Option<NamedMetadata> {
        match self {
                    Self::NamedMetadata(value) => Some(value),
                    _ => None,
                }
    }
}
