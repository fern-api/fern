pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct TestSubmissionUpdateInfoOne {
    pub r#type: TestSubmissionUpdateInfoOneType,
}

impl TestSubmissionUpdateInfoOne {
    pub fn builder() -> TestSubmissionUpdateInfoOneBuilder {
        <TestSubmissionUpdateInfoOneBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct TestSubmissionUpdateInfoOneBuilder {
    r#type: Option<TestSubmissionUpdateInfoOneType>,
}

impl TestSubmissionUpdateInfoOneBuilder {
    pub fn r#type(mut self, value: TestSubmissionUpdateInfoOneType) -> Self {
        self.r#type = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`TestSubmissionUpdateInfoOne`].
    /// This method will fail if any of the following fields are not set:
    /// - [`r#type`](TestSubmissionUpdateInfoOneBuilder::r#type)
    pub fn build(self) -> Result<TestSubmissionUpdateInfoOne, BuildError> {
        Ok(TestSubmissionUpdateInfoOne {
            r#type: self.r#type.ok_or_else(|| BuildError::missing_field("r#type"))?,
        })
    }
}
