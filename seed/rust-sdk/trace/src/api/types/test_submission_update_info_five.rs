pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestSubmissionUpdateInfoFive {
    pub r#type: TestSubmissionUpdateInfoFiveType,
}

impl TestSubmissionUpdateInfoFive {
    pub fn builder() -> TestSubmissionUpdateInfoFiveBuilder {
        <TestSubmissionUpdateInfoFiveBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionUpdateInfoFiveBuilder {
    r#type: Option<TestSubmissionUpdateInfoFiveType>,
}

impl TestSubmissionUpdateInfoFiveBuilder {
    pub fn r#type(mut self, value: TestSubmissionUpdateInfoFiveType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionUpdateInfoFive`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](TestSubmissionUpdateInfoFiveBuilder::r#type)
    pub fn build(self) -> Result<TestSubmissionUpdateInfoFive, BuildError> {
        Ok(TestSubmissionUpdateInfoFive {
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
