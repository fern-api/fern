pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct WorkspaceSubmissionUpdate {
    #[serde(rename = "updateTime")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub update_time: DateTime<FixedOffset>,
    #[serde(rename = "updateInfo")]
    pub update_info: WorkspaceSubmissionUpdateInfo,
}

impl WorkspaceSubmissionUpdate {
    pub fn builder() -> WorkspaceSubmissionUpdateBuilder {
        WorkspaceSubmissionUpdateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct WorkspaceSubmissionUpdateBuilder {
    update_time: Option<DateTime<FixedOffset>>,
    update_info: Option<WorkspaceSubmissionUpdateInfo>,
}

impl WorkspaceSubmissionUpdateBuilder {
    pub fn update_time(mut self, value: DateTime<FixedOffset>) -> Self {
        self.update_time = Some(value);
        self
    }

    pub fn update_info(mut self, value: WorkspaceSubmissionUpdateInfo) -> Self {
        self.update_info = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`WorkspaceSubmissionUpdate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`update_time`](WorkspaceSubmissionUpdateBuilder::update_time)
    /// - [`update_info`](WorkspaceSubmissionUpdateBuilder::update_info)
    pub fn build(self) -> Result<WorkspaceSubmissionUpdate, BuildError> {
        Ok(WorkspaceSubmissionUpdate {
            update_time: self
                .update_time
                .ok_or_else(|| BuildError::missing_field("update_time"))?,
            update_info: self
                .update_info
                .ok_or_else(|| BuildError::missing_field("update_info"))?,
        })
    }
}
