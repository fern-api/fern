pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnionWithNoPropertiesType {
    pub r#type: UnionWithNoPropertiesTypeType,
}

impl UnionWithNoPropertiesType {
    pub fn builder() -> UnionWithNoPropertiesTypeBuilder {
        <UnionWithNoPropertiesTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnionWithNoPropertiesTypeBuilder {
    r#type: Option<UnionWithNoPropertiesTypeType>,
}

impl UnionWithNoPropertiesTypeBuilder {
    pub fn r#type(mut self, value: UnionWithNoPropertiesTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnionWithNoPropertiesType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](UnionWithNoPropertiesTypeBuilder::r#type)
    pub fn build(self) -> Result<UnionWithNoPropertiesType, BuildError> {
        Ok(UnionWithNoPropertiesType {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
