pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct WorkspaceTracedUpdate {
    #[serde(rename = "traceResponsesSize")]
    #[serde(default)]
    pub trace_responses_size: i64,
}

impl WorkspaceTracedUpdate {
    pub fn builder() -> WorkspaceTracedUpdateBuilder {
        WorkspaceTracedUpdateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceTracedUpdateBuilder {
    trace_responses_size: Option<i64>,
}

impl WorkspaceTracedUpdateBuilder {
    pub fn trace_responses_size(mut self, value: i64) -> Self {
        self.trace_responses_size = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceTracedUpdate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`trace_responses_size`](WorkspaceTracedUpdateBuilder::trace_responses_size)
    pub fn build(self) -> Result<WorkspaceTracedUpdate, BuildError> {
        Ok(WorkspaceTracedUpdate {
            trace_responses_size: self.trace_responses_size.ok_or_else(|| BuildError::missing_field("trace_responses_size"))?,
        })
    }
}
