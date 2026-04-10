pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithBasePropertiesTwo {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithBasePropertiesTwoType,
}

impl UnionWithBasePropertiesTwo {
    pub fn builder() -> UnionWithBasePropertiesTwoBuilder {
        <UnionWithBasePropertiesTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithBasePropertiesTwoBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithBasePropertiesTwoType>,
}

impl UnionWithBasePropertiesTwoBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithBasePropertiesTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithBasePropertiesTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithBasePropertiesTwoBuilder::foo_fields)
    /// - [`r#type`](UnionWithBasePropertiesTwoBuilder::r#type)
    pub fn build(self) -> Result<UnionWithBasePropertiesTwo, BuildError> {
        Ok(UnionWithBasePropertiesTwo {
            foo_fields: self.foo_fields.ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
