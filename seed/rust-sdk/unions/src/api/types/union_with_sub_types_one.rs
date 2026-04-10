pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithSubTypesOne {
    #[serde(flatten)]
    pub foo_extended_fields: FooExtended,
    pub r#type: UnionWithSubTypesOneType,
}

impl UnionWithSubTypesOne {
    pub fn builder() -> UnionWithSubTypesOneBuilder {
        <UnionWithSubTypesOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithSubTypesOneBuilder {
    foo_extended_fields: Option<FooExtended>,
    r#type: Option<UnionWithSubTypesOneType>,
}

impl UnionWithSubTypesOneBuilder {
    pub fn foo_extended_fields(mut self, value: FooExtended) -> Self {
        self.foo_extended_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithSubTypesOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithSubTypesOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_extended_fields`](UnionWithSubTypesOneBuilder::foo_extended_fields)
    /// - [`r#type`](UnionWithSubTypesOneBuilder::r#type)
    pub fn build(self) -> Result<UnionWithSubTypesOne, BuildError> {
        Ok(UnionWithSubTypesOne {
            foo_extended_fields: self
                .foo_extended_fields
                .ok_or_else(|| BuildError::missing_field("foo_extended_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
