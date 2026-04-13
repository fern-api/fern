pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithMultipleNoPropertiesZero {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithMultipleNoPropertiesZeroType,
}

impl UnionWithMultipleNoPropertiesZero {
    pub fn builder() -> UnionWithMultipleNoPropertiesZeroBuilder {
        <UnionWithMultipleNoPropertiesZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithMultipleNoPropertiesZeroBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithMultipleNoPropertiesZeroType>,
}

impl UnionWithMultipleNoPropertiesZeroBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithMultipleNoPropertiesZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithMultipleNoPropertiesZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithMultipleNoPropertiesZeroBuilder::foo_fields)
    /// - [`r#type`](UnionWithMultipleNoPropertiesZeroBuilder::r#type)
    pub fn build(self) -> Result<UnionWithMultipleNoPropertiesZero, BuildError> {
        Ok(UnionWithMultipleNoPropertiesZero {
            foo_fields: self.foo_fields.ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
