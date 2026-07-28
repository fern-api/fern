pub use crate::prelude::*;
#[allow(unused_imports)]
use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct IdentifierUpdate {
    /// The identifier type to update.
    #[serde(rename = "idType")]
    #[serde(default)]
    pub id_type: String,
    #[serde(rename = "oldValue")]
    #[serde(default)]
    pub old_value: String,
    #[serde(rename = "newValue")]
    #[serde(default)]
    pub new_value: String,
}

impl IdentifierUpdate {
    pub fn builder() -> IdentifierUpdateBuilder {
        <IdentifierUpdateBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct IdentifierUpdateBuilder {
    id_type: Option<String>,
    old_value: Option<String>,
    new_value: Option<String>,
}

impl IdentifierUpdateBuilder {
    pub fn id_type(mut self, value: impl Into<String>) -> Self {
        self.id_type = Some(value.into());
        self
    }

    pub fn old_value(mut self, value: impl Into<String>) -> Self {
        self.old_value = Some(value.into());
        self
    }

    pub fn new_value(mut self, value: impl Into<String>) -> Self {
        self.new_value = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`IdentifierUpdate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id_type`](IdentifierUpdateBuilder::id_type)
    /// - [`old_value`](IdentifierUpdateBuilder::old_value)
    /// - [`new_value`](IdentifierUpdateBuilder::new_value)
    pub fn build(self) -> Result<IdentifierUpdate, BuildError> {
        Ok(IdentifierUpdate {
            id_type: self.id_type.ok_or_else(|| BuildError::missing_field("id_type"))?,
            old_value: self.old_value.ok_or_else(|| BuildError::missing_field("old_value"))?,
            new_value: self.new_value.ok_or_else(|| BuildError::missing_field("new_value"))?,
        })
    }
}

