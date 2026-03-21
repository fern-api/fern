pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExecutionSessionState {
    #[serde(rename = "lastTimeContacted")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_time_contacted: Option<String>,
    /// The auto-generated session id. Formatted as a uuid.
    #[serde(rename = "sessionId")]
    #[serde(default)]
    pub session_id: String,
    #[serde(rename = "isWarmInstance")]
    #[serde(default)]
    pub is_warm_instance: bool,
    #[serde(rename = "awsTaskId")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub aws_task_id: Option<String>,
    pub language: Language,
    pub status: ExecutionSessionStatus,
}

impl ExecutionSessionState {
    pub fn builder() -> ExecutionSessionStateBuilder {
        ExecutionSessionStateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExecutionSessionStateBuilder {
    last_time_contacted: Option<String>,
    session_id: Option<String>,
    is_warm_instance: Option<bool>,
    aws_task_id: Option<String>,
    language: Option<Language>,
    status: Option<ExecutionSessionStatus>,
}

impl ExecutionSessionStateBuilder {
    pub fn last_time_contacted(mut self, value: impl Into<String>) -> Self {
        self.last_time_contacted = Some(value.into());
        self
    }

    pub fn session_id(mut self, value: impl Into<String>) -> Self {
        self.session_id = Some(value.into());
        self
    }

    pub fn is_warm_instance(mut self, value: bool) -> Self {
        self.is_warm_instance = Some(value);
        self
    }

    pub fn aws_task_id(mut self, value: impl Into<String>) -> Self {
        self.aws_task_id = Some(value.into());
        self
    }

    pub fn language(mut self, value: Language) -> Self {
        self.language = Some(value);
        self
    }

    pub fn status(mut self, value: ExecutionSessionStatus) -> Self {
        self.status = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExecutionSessionState`].
    /// This method will fail if any of the following fields are not set:
    /// - [`session_id`](ExecutionSessionStateBuilder::session_id)
    /// - [`is_warm_instance`](ExecutionSessionStateBuilder::is_warm_instance)
    /// - [`language`](ExecutionSessionStateBuilder::language)
    /// - [`status`](ExecutionSessionStateBuilder::status)
    pub fn build(self) -> Result<ExecutionSessionState, BuildError> {
        Ok(ExecutionSessionState {
            last_time_contacted: self.last_time_contacted,
            session_id: self.session_id.ok_or_else(|| BuildError::missing_field("session_id"))?,
            is_warm_instance: self.is_warm_instance.ok_or_else(|| BuildError::missing_field("is_warm_instance"))?,
            aws_task_id: self.aws_task_id,
            language: self.language.ok_or_else(|| BuildError::missing_field("language"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
