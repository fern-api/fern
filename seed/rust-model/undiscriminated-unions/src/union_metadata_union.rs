pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum UnionMetadataUnion {
        OptionalMetadata(UnionOptionalMetadata),

        NamedMetadata(UnionNamedMetadata),
}

impl UnionMetadataUnion {
    pub fn is_optionalmetadata(&self) -> bool {
        matches!(self, Self::OptionalMetadata(_))
    }

    pub fn is_namedmetadata(&self) -> bool {
        matches!(self, Self::NamedMetadata(_))
    }


    pub fn as_optionalmetadata(&self) -> Option<&UnionOptionalMetadata> {
        match self {
                    Self::OptionalMetadata(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_optionalmetadata(self) -> Option<UnionOptionalMetadata> {
        match self {
                    Self::OptionalMetadata(value) => Some(value),
                    _ => None,
                }
    }

    pub fn as_namedmetadata(&self) -> Option<&UnionNamedMetadata> {
        match self {
                    Self::NamedMetadata(value) => Some(value),
                    _ => None,
                }
    }

    pub fn into_namedmetadata(self) -> Option<UnionNamedMetadata> {
        match self {
                    Self::NamedMetadata(value) => Some(value),
                    _ => None,
                }
    }

}
