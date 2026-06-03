pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RuleResponse {
    /// The user who created this resource.
    #[serde(rename = "createdBy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_by: Option<String>,
    /// When this resource was created.
    #[serde(rename = "createdDateTime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub created_date_time: Option<DateTime<FixedOffset>>,
    /// The user who last modified this resource.
    #[serde(rename = "modifiedBy")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modified_by: Option<String>,
    /// When this resource was last modified.
    #[serde(rename = "modifiedDateTime")]
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset::option")]
    pub modified_date_time: Option<DateTime<FixedOffset>>,
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    pub status: RuleResponseStatus,
    #[serde(rename = "executionContext")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub execution_context: Option<RuleExecutionContext>,
}

impl RuleResponse {
    pub fn builder() -> RuleResponseBuilder {
        <RuleResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct RuleResponseBuilder {
    created_by: Option<String>,
    created_date_time: Option<DateTime<FixedOffset>>,
    modified_by: Option<String>,
    modified_date_time: Option<DateTime<FixedOffset>>,
    id: Option<String>,
    name: Option<String>,
    status: Option<RuleResponseStatus>,
    execution_context: Option<RuleExecutionContext>,
}

impl RuleResponseBuilder {
    pub fn created_by(mut self, value: impl Into<String>) -> Self {
        self.created_by = Some(value.into());
        self
    }

    pub fn created_date_time(mut self, value: DateTime<FixedOffset>) -> Self {
        self.created_date_time = Some(value);
        self
    }

    pub fn modified_by(mut self, value: impl Into<String>) -> Self {
        self.modified_by = Some(value.into());
        self
    }

    pub fn modified_date_time(mut self, value: DateTime<FixedOffset>) -> Self {
        self.modified_date_time = Some(value);
        self
    }

    pub fn id(mut self, value: impl Into<String>) -> Self {
        self.id = Some(value.into());
        self
    }

    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn status(mut self, value: RuleResponseStatus) -> Self {
        self.status = Some(value);
        self
    }

    pub fn execution_context(mut self, value: RuleExecutionContext) -> Self {
        self.execution_context = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`RuleResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](RuleResponseBuilder::id)
    /// - [`name`](RuleResponseBuilder::name)
    /// - [`status`](RuleResponseBuilder::status)
    pub fn build(self) -> Result<RuleResponse, BuildError> {
        Ok(RuleResponse {
            created_by: self.created_by,
            created_date_time: self.created_date_time,
            modified_by: self.modified_by,
            modified_date_time: self.modified_date_time,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
            execution_context: self.execution_context,
        })
    }
}
