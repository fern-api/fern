pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExtendedWithEnum {
    #[serde(flatten)]
    pub base_with_enum_fields: BaseWithEnum,
    #[serde(default)]
    pub description: String,
}

impl ExtendedWithEnum {
    pub fn builder() -> ExtendedWithEnumBuilder {
        <ExtendedWithEnumBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExtendedWithEnumBuilder {
    base_with_enum_fields: Option<BaseWithEnum>,
    description: Option<String>,
}

impl ExtendedWithEnumBuilder {
    pub fn base_with_enum_fields(mut self, value: BaseWithEnum) -> Self {
        self.base_with_enum_fields = Some(value);
        self
    }

    pub fn description(mut self, value: impl Into<String>) -> Self {
        self.description = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`ExtendedWithEnum`].
    /// This method will fail if any of the following fields are not set:
    /// - [`base_with_enum_fields`](ExtendedWithEnumBuilder::base_with_enum_fields)
    /// - [`description`](ExtendedWithEnumBuilder::description)
    pub fn build(self) -> Result<ExtendedWithEnum, BuildError> {
        Ok(ExtendedWithEnum {
            base_with_enum_fields: self
                .base_with_enum_fields
                .ok_or_else(|| BuildError::missing_field("base_with_enum_fields"))?,
            description: self
                .description
                .ok_or_else(|| BuildError::missing_field("description"))?,
        })
    }
}
