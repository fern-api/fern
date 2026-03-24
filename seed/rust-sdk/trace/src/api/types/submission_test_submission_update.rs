pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct TestSubmissionUpdate {
    #[serde(rename = "updateTime")]
    #[serde(default)]
    #[serde(with = "crate::core::flexible_datetime::offset")]
    pub update_time: DateTime<FixedOffset>,
    #[serde(rename = "updateInfo")]
    pub update_info: TestSubmissionUpdateInfo,
}

impl TestSubmissionUpdate {
    pub fn builder() -> TestSubmissionUpdateBuilder {
        TestSubmissionUpdateBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionUpdateBuilder {
    update_time: Option<DateTime<FixedOffset>>,
    update_info: Option<TestSubmissionUpdateInfo>,
}

impl TestSubmissionUpdateBuilder {
    pub fn update_time(mut self, value: DateTime<FixedOffset>) -> Self {
        self.update_time = Some(value);
        self
    }

    pub fn update_info(mut self, value: TestSubmissionUpdateInfo) -> Self {
        self.update_info = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionUpdate`].
    /// This method will fail if any of the following fields are not set:
    /// - [`update_time`](TestSubmissionUpdateBuilder::update_time)
    /// - [`update_info`](TestSubmissionUpdateBuilder::update_info)
    pub fn build(self) -> Result<TestSubmissionUpdate, BuildError> {
        Ok(TestSubmissionUpdate {
            update_time: self
                .update_time
                .ok_or_else(|| BuildError::missing_field("update_time"))?,
            update_info: self
                .update_info
                .ok_or_else(|| BuildError::missing_field("update_info"))?,
        })
    }
}
