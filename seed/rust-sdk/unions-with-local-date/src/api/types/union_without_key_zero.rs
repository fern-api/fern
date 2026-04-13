pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithoutKeyZero {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithoutKeyZeroType,
}

impl UnionWithoutKeyZero {
    pub fn builder() -> UnionWithoutKeyZeroBuilder {
        <UnionWithoutKeyZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithoutKeyZeroBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithoutKeyZeroType>,
}

impl UnionWithoutKeyZeroBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithoutKeyZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithoutKeyZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithoutKeyZeroBuilder::foo_fields)
    /// - [`r#type`](UnionWithoutKeyZeroBuilder::r#type)
    pub fn build(self) -> Result<UnionWithoutKeyZero, BuildError> {
        Ok(UnionWithoutKeyZero {
            foo_fields: self
                .foo_fields
                .ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
