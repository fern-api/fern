pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithSingleElement {
    #[serde(flatten)]
    pub foo_fields: Foo,
    pub r#type: UnionWithSingleElementType,
}

impl UnionWithSingleElement {
    pub fn builder() -> UnionWithSingleElementBuilder {
        <UnionWithSingleElementBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithSingleElementBuilder {
    foo_fields: Option<Foo>,
    r#type: Option<UnionWithSingleElementType>,
}

impl UnionWithSingleElementBuilder {
    pub fn foo_fields(mut self, value: Foo) -> Self {
        self.foo_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: UnionWithSingleElementType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithSingleElement`].
    /// This method will fail if any of the following fields are not set:
    /// - [`foo_fields`](UnionWithSingleElementBuilder::foo_fields)
    /// - [`r#type`](UnionWithSingleElementBuilder::r#type)
    pub fn build(self) -> Result<UnionWithSingleElement, BuildError> {
        Ok(UnionWithSingleElement {
            foo_fields: self
                .foo_fields
                .ok_or_else(|| BuildError::missing_field("foo_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
