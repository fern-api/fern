pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct UnionWithDuplicativeDiscriminantsOne {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub r#type: Option<UnionWithDuplicativeDiscriminantsOneType>,
    #[serde(default)]
    pub title: String,
}

impl UnionWithDuplicativeDiscriminantsOne {
    pub fn builder() -> UnionWithDuplicativeDiscriminantsOneBuilder {
        <UnionWithDuplicativeDiscriminantsOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithDuplicativeDiscriminantsOneBuilder {
    r#type: Option<UnionWithDuplicativeDiscriminantsOneType>,
    title: Option<String>,
}

impl UnionWithDuplicativeDiscriminantsOneBuilder {
    pub fn r#type(mut self, value: UnionWithDuplicativeDiscriminantsOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`UnionWithDuplicativeDiscriminantsOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`title`](UnionWithDuplicativeDiscriminantsOneBuilder::title)
    pub fn build(self) -> Result<UnionWithDuplicativeDiscriminantsOne, BuildError> {
        Ok(UnionWithDuplicativeDiscriminantsOne {
            r#type: self.r#type,
            title: self
                .title
                .ok_or_else(|| BuildError::missing_field("title"))?,
        })
    }
}
