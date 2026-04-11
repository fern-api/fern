pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetExecutionSessionStateResponse {
    #[serde(default)]
    pub states: HashMap<String, ExecutionSessionState>,
    #[serde(rename = "numWarmingInstances")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub num_warming_instances: Option<i64>,
    #[serde(rename = "warmingSessionIds")]
    #[serde(default)]
    pub warming_session_ids: Vec<String>,
}

impl GetExecutionSessionStateResponse {
    pub fn builder() -> GetExecutionSessionStateResponseBuilder {
        <GetExecutionSessionStateResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetExecutionSessionStateResponseBuilder {
    states: Option<HashMap<String, ExecutionSessionState>>,
    num_warming_instances: Option<i64>,
    warming_session_ids: Option<Vec<String>>,
}

impl GetExecutionSessionStateResponseBuilder {
    pub fn states(mut self, value: HashMap<String, ExecutionSessionState>) -> Self {
        self.states = Some(value);
        self
    }

    pub fn num_warming_instances(mut self, value: i64) -> Self {
        self.num_warming_instances = Some(value);
        self
    }

    pub fn warming_session_ids(mut self, value: Vec<String>) -> Self {
        self.warming_session_ids = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetExecutionSessionStateResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`states`](GetExecutionSessionStateResponseBuilder::states)
    /// - [`warming_session_ids`](GetExecutionSessionStateResponseBuilder::warming_session_ids)
    pub fn build(self) -> Result<GetExecutionSessionStateResponse, BuildError> {
        Ok(GetExecutionSessionStateResponse {
            states: self
                .states
                .ok_or_else(|| BuildError::missing_field("states"))?,
            num_warming_instances: self.num_warming_instances,
            warming_session_ids: self
                .warming_session_ids
                .ok_or_else(|| BuildError::missing_field("warming_session_ids"))?,
        })
    }
}
