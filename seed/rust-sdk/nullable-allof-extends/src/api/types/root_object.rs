pub use crate::prelude::*;

/// Object inheriting from a nullable schema via allOf.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RootObject {
    #[serde(flatten)]
    pub normal_object_fields: NormalObject,
    #[serde(flatten)]
    pub nullable_object_fields: NullableObject,
}
