pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct ExecutionSessionResponse {
    #[serde(rename = "sessionId")]
    #[serde(default)]
    pub session_id: String,
    #[serde(rename = "executionSessionUrl")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub execution_session_url: Option<String>,
    pub language: Language,
    pub status: ExecutionSessionStatus,
}

impl ExecutionSessionResponse {
    pub fn builder() -> ExecutionSessionResponseBuilder {
        ExecutionSessionResponseBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExecutionSessionResponseBuilder {
    session_id: Option<String>,
    execution_session_url: Option<String>,
    language: Option<Language>,
    status: Option<ExecutionSessionStatus>,
}

impl ExecutionSessionResponseBuilder {
    pub fn session_id(mut self, value: impl Into<String>) -> Self {
        self.session_id = Some(value.into());
        self
    }

    pub fn execution_session_url(mut self, value: impl Into<String>) -> Self {
        self.execution_session_url = Some(value.into());
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

    /// Consumes the builder and constructs a [`ExecutionSessionResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`session_id`](ExecutionSessionResponseBuilder::session_id)
    /// - [`language`](ExecutionSessionResponseBuilder::language)
    /// - [`status`](ExecutionSessionResponseBuilder::status)
    pub fn build(self) -> Result<ExecutionSessionResponse, BuildError> {
        Ok(ExecutionSessionResponse {
            session_id: self.session_id.ok_or_else(|| BuildError::missing_field("session_id"))?,
            execution_session_url: self.execution_session_url,
            language: self.language.ok_or_else(|| BuildError::missing_field("language"))?,
            status: self.status.ok_or_else(|| BuildError::missing_field("status"))?,
        })
    }
}
