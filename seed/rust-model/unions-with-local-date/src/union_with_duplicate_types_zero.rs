pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithDuplicateTypesZero {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithDuplicateTypesZeroType,
}

impl UnionWithDuplicateTypesZero {
    pub fn builder() -> UnionWithDuplicateTypesZeroBuilder {
        <UnionWithDuplicateTypesZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithDuplicateTypesZeroBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithDuplicateTypesZeroType>,
}

impl UnionWithDuplicateTypesZeroBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithDuplicateTypesZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithDuplicateTypesZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithDuplicateTypesZeroBuilder::foo_fields)
    /// - [`r#type`](UnionWithDuplicateTypesZeroBuilder::r#type)
    pub fn build(self) -> Result<UnionWithDuplicateTypesZero, BuildError> {
        Ok(UnionWithDuplicateTypesZero {
            foo_fields: self.foo_fields.ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
