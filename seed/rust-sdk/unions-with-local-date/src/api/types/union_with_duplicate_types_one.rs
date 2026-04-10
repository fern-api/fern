pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithDuplicateTypesOne {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithDuplicateTypesOneType,
}

impl UnionWithDuplicateTypesOne {
    pub fn builder() -> UnionWithDuplicateTypesOneBuilder {
        <UnionWithDuplicateTypesOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithDuplicateTypesOneBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithDuplicateTypesOneType>,
}

impl UnionWithDuplicateTypesOneBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithDuplicateTypesOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithDuplicateTypesOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithDuplicateTypesOneBuilder::foo_fields)
    /// - [`r#type`](UnionWithDuplicateTypesOneBuilder::r#type)
    pub fn build(self) -> Result<UnionWithDuplicateTypesOne, BuildError> {
        Ok(UnionWithDuplicateTypesOne {
            foo_fields: self
                .foo_fields
                .ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
