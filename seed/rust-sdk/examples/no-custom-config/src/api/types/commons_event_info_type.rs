pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CommonsEventInfoType {
    pub r#type: CommonsEventInfoTypeType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub value: Option<CommonsTag>,
}

impl CommonsEventInfoType {
    pub fn builder() -> CommonsEventInfoTypeBuilder {
        <CommonsEventInfoTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CommonsEventInfoTypeBuilder {
    r#type: Option<CommonsEventInfoTypeType>,
    value: Option<CommonsTag>,
}

impl CommonsEventInfoTypeBuilder {
    pub fn r#type(mut self, value: CommonsEventInfoTypeType) -> Self {
        self.r#type = Some(value);
        self
    }

    pub fn value(mut self, value: CommonsTag) -> Self {
        self.value = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CommonsEventInfoType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](CommonsEventInfoTypeBuilder::r#type)
    pub fn build(self) -> Result<CommonsEventInfoType, BuildError> {
        Ok(CommonsEventInfoType {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            value: self.value,
        })
    }
}
