pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionWithDuplicativeDiscriminantsZero {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<UnionWithDuplicativeDiscriminantsZeroType>,
    #[serde(default)]
    pub name: String,
}

impl UnionWithDuplicativeDiscriminantsZero {
    pub fn builder() -> UnionWithDuplicativeDiscriminantsZeroBuilder {
        <UnionWithDuplicativeDiscriminantsZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithDuplicativeDiscriminantsZeroBuilder {
    r#type: Option<UnionWithDuplicativeDiscriminantsZeroType>,
    name: Option<String>,
}

impl UnionWithDuplicativeDiscriminantsZeroBuilder {
    pub fn r#type(mut self, value: UnionWithDuplicativeDiscriminantsZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnionWithDuplicativeDiscriminantsZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`name`](UnionWithDuplicativeDiscriminantsZeroBuilder::name)
    pub fn build(self) -> Result<UnionWithDuplicativeDiscriminantsZero, BuildError> {
        Ok(UnionWithDuplicativeDiscriminantsZero {
            r#type: self.r#type,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
        })
    }
}
