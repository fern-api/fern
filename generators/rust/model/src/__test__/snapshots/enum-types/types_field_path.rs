pub use crate::prelude::*;

#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum FieldPath {
    Id,
    ItemFeature,
    /// This variant is used for forward compatibility.
    /// If the server sends a value not recognized by the current SDK version,
    /// it will be captured here with the raw string value.
    __Unknown(String),
}
impl Serialize for FieldPath {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        match self {
            Self::Id => serializer.serialize_str("id"),
            Self::ItemFeature => serializer.serialize_str("item.features.{feature_name}"),
            Self::__Unknown(val) => serializer.serialize_str(val),
        }
    }
}

impl<'de> Deserialize<'de> for FieldPath {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let value = String::deserialize(deserializer)?;
        match value.as_str() {
            "id" => Ok(Self::Id),
            "item.features.{feature_name}" => Ok(Self::ItemFeature),
            _ => Ok(Self::__Unknown(value)),
        }
    }
}

impl fmt::Display for FieldPath {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Id => write!(f, "id"),
            Self::ItemFeature => write!(f, "item.features.{{feature_name}}"),
            Self::__Unknown(val) => write!(f, "{}", val),
        }
    }
}
