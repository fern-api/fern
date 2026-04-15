pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct RuleResponse {
    #[serde(flatten)]
    pub audit_info_fields: AuditInfo,
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
    audit_info_fields: Option<AuditInfo>,
    id: Option<String>,
    name: Option<String>,
    status: Option<RuleResponseStatus>,
    execution_context: Option<RuleExecutionContext>,
}

impl RuleResponseBuilder {
    pub fn audit_info_fields(mut self, value: AuditInfo) -> Self {
        self.audit_info_fields = Some(value);
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
    /// - [`audit_info_fields`](RuleResponseBuilder::audit_info_fields)
    /// - [`id`](RuleResponseBuilder::id)
    /// - [`name`](RuleResponseBuilder::name)
    /// - [`status`](RuleResponseBuilder::status)
    pub fn build(self) -> Result<RuleResponse, BuildError> {
        Ok(RuleResponse {
            audit_info_fields: self
                .audit_info_fields
                .ok_or_else(|| BuildError::missing_field("audit_info_fields"))?,
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            name: self.name.ok_or_else(|| BuildError::missing_field("name"))?,
            status: self
                .status
                .ok_or_else(|| BuildError::missing_field("status"))?,
            execution_context: self.execution_context,
        })
    }
}
