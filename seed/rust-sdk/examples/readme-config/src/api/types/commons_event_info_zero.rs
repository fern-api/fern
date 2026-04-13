pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CommonsEventInfoZero {
    #[serde(flatten)]
    pub commons_metadata_fields: CommonsMetadata,
    pub r#type: CommonsEventInfoZeroType,
}

impl CommonsEventInfoZero {
    pub fn builder() -> CommonsEventInfoZeroBuilder {
        <CommonsEventInfoZeroBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CommonsEventInfoZeroBuilder {
    commons_metadata_fields: Option<CommonsMetadata>,
    r#type: Option<CommonsEventInfoZeroType>,
}

impl CommonsEventInfoZeroBuilder {
    pub fn commons_metadata_fields(mut self, value: CommonsMetadata) -> Self {
        self.commons_metadata_fields = Some(value);
        self
    }

    pub fn r#type(mut self, value: CommonsEventInfoZeroType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CommonsEventInfoZero`].
    /// This method will fail if any of the following fields are not set:
    /// - [`commons_metadata_fields`](CommonsEventInfoZeroBuilder::commons_metadata_fields)
    /// - [`r#type`](CommonsEventInfoZeroBuilder::r#type)
    pub fn build(self) -> Result<CommonsEventInfoZero, BuildError> {
        Ok(CommonsEventInfoZero {
            commons_metadata_fields: self
                .commons_metadata_fields
                .ok_or_else(|| BuildError::missing_field("commons_metadata_fields"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
