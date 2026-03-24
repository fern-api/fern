pub use crate::prelude::*;

/// Object inheriting from a nullable schema via allOf.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RootObject {
    #[serde(flatten)]
    pub normal_object_fields: NormalObject,
    #[serde(flatten)]
    pub nullable_object_fields: NullableObject,
}

impl RootObject {
    pub fn builder() -> RootObjectBuilder {
        RootObjectBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RootObjectBuilder {
    normal_object_fields: Option<NormalObject>,
    nullable_object_fields: Option<NullableObject>,
}

impl RootObjectBuilder {
    pub fn normal_object_fields(mut self, value: NormalObject) -> Self {
        self.normal_object_fields = Some(value);
        self
    }

    pub fn nullable_object_fields(mut self, value: NullableObject) -> Self {
        self.nullable_object_fields = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RootObject`].
    /// This method will fail if any of the following fields are not set:
    /// - [`normal_object_fields`](RootObjectBuilder::normal_object_fields)
    /// - [`nullable_object_fields`](RootObjectBuilder::nullable_object_fields)
    pub fn build(self) -> Result<RootObject, BuildError> {
        Ok(RootObject {
            normal_object_fields: self
                .normal_object_fields
                .ok_or_else(|| BuildError::missing_field("normal_object_fields"))?,
            nullable_object_fields: self
                .nullable_object_fields
                .ok_or_else(|| BuildError::missing_field("nullable_object_fields"))?,
        })
    }
}
