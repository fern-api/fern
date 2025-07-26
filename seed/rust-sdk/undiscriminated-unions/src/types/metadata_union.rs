use crate::optional_metadata::OptionalMetadata;
use crate::named_metadata::NamedMetadata;
use serde::{Deserialize, Serialize};

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
