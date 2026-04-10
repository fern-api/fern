pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct CommonsMetadata {
    #[serde(default)]
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<HashMap<String, Option<String>>>,
    #[serde(rename = "jsonString")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub json_string: Option<String>,
}

impl CommonsMetadata {
    pub fn builder() -> CommonsMetadataBuilder {
        <CommonsMetadataBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CommonsMetadataBuilder {
    id: Option<String>,
    data: Option<HashMap<String, Option<String>>>,
    json_string: Option<String>,
}

impl CommonsMetadataBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn data(mut self, value: HashMap<String, Option<String>>) -> Self {
        self.data = Some(value);
        self
    }

    pub fn json_string(mut self, value: impl Into<String>) -> Self {
        self.json_string = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`CommonsMetadata`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](CommonsMetadataBuilder::id)
    pub fn build(self) -> Result<CommonsMetadata, BuildError> {
        Ok(CommonsMetadata {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            data: self.data,
            json_string: self.json_string,
        })
    }
}
