pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithMultipleNoPropertiesTwo {
    pub r#type: UnionWithMultipleNoPropertiesTwoType,
}

impl UnionWithMultipleNoPropertiesTwo {
    pub fn builder() -> UnionWithMultipleNoPropertiesTwoBuilder {
        <UnionWithMultipleNoPropertiesTwoBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithMultipleNoPropertiesTwoBuilder {
    r#type: Option<UnionWithMultipleNoPropertiesTwoType>,
}

impl UnionWithMultipleNoPropertiesTwoBuilder {
    pub fn r#type(mut self, value: UnionWithMultipleNoPropertiesTwoType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithMultipleNoPropertiesTwo`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UnionWithMultipleNoPropertiesTwoBuilder::r#type)
    pub fn build(self) -> Result<UnionWithMultipleNoPropertiesTwo, BuildError> {
        Ok(UnionWithMultipleNoPropertiesTwo {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
