pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithMultipleNoPropertiesOne {
    pub r#type: UnionWithMultipleNoPropertiesOneType,
}

impl UnionWithMultipleNoPropertiesOne {
    pub fn builder() -> UnionWithMultipleNoPropertiesOneBuilder {
        <UnionWithMultipleNoPropertiesOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithMultipleNoPropertiesOneBuilder {
    r#type: Option<UnionWithMultipleNoPropertiesOneType>,
}

impl UnionWithMultipleNoPropertiesOneBuilder {
    pub fn r#type(mut self, value: UnionWithMultipleNoPropertiesOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithMultipleNoPropertiesOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UnionWithMultipleNoPropertiesOneBuilder::r#type)
    pub fn build(self) -> Result<UnionWithMultipleNoPropertiesOne, BuildError> {
        Ok(UnionWithMultipleNoPropertiesOne {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
