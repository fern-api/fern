pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct RuleType {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

impl RuleType {
    pub fn builder() -> RuleTypeBuilder {
        <RuleTypeBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RuleTypeBuilder {
    id: Option<String>,
    name: Option<String>,
    description: Option<String>,
}

impl RuleTypeBuilder {
    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn description(mut self, value: impl Into<String>) -> Self {
        self.description = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`RuleType`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](RuleTypeBuilder::id)
    /// - [`name`](RuleTypeBuilder::name)
    pub fn build(self) -> Result<RuleType, BuildError> {
        Ok(RuleType {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            description: self.description,
        })
    }
}
