pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithSubTypesZero {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithSubTypesZeroType,
}

impl UnionWithSubTypesZero {
    pub fn builder() -> UnionWithSubTypesZeroBuilder {
        <UnionWithSubTypesZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithSubTypesZeroBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithSubTypesZeroType>,
}

impl UnionWithSubTypesZeroBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithSubTypesZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithSubTypesZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithSubTypesZeroBuilder::foo_fields)
    /// - [`r#type`](UnionWithSubTypesZeroBuilder::r#type)
    pub fn build(self) -> Result<UnionWithSubTypesZero, BuildError> {
        Ok(UnionWithSubTypesZero {
            foo_fields: self.foo_fields.ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
