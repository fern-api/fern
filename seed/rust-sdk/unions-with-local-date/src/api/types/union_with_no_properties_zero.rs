pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithNoPropertiesZero {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithNoPropertiesZeroType,
}

impl UnionWithNoPropertiesZero {
    pub fn builder() -> UnionWithNoPropertiesZeroBuilder {
        <UnionWithNoPropertiesZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithNoPropertiesZeroBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithNoPropertiesZeroType>,
}

impl UnionWithNoPropertiesZeroBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithNoPropertiesZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithNoPropertiesZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithNoPropertiesZeroBuilder::foo_fields)
    /// - [`r#type`](UnionWithNoPropertiesZeroBuilder::r#type)
    pub fn build(self) -> Result<UnionWithNoPropertiesZero, BuildError> {
        Ok(UnionWithNoPropertiesZero {
            foo_fields: self
                .foo_fields
                .ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
