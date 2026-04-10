pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2GetGeneratedTestCaseFileRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<V2TestCaseTemplate>,
    #[serde(rename = "testCase")]
    pub test_case: V2TestCaseV2,
}

impl V2GetGeneratedTestCaseFileRequest {
    pub fn builder() -> V2GetGeneratedTestCaseFileRequestBuilder {
        <V2GetGeneratedTestCaseFileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2GetGeneratedTestCaseFileRequestBuilder {
    template: Option<V2TestCaseTemplate>,
    test_case: Option<V2TestCaseV2>,
}

impl V2GetGeneratedTestCaseFileRequestBuilder {
    pub fn template(mut self, value: V2TestCaseTemplate) -> Self {
        self.template = Some(value);
        self
    }

    pub fn test_case(mut self, value: V2TestCaseV2) -> Self {
        self.test_case = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2GetGeneratedTestCaseFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case`](V2GetGeneratedTestCaseFileRequestBuilder::test_case)
    pub fn build(self) -> Result<V2GetGeneratedTestCaseFileRequest, BuildError> {
        Ok(V2GetGeneratedTestCaseFileRequest {
            template: self.template,
            test_case: self
                .test_case
                .ok_or_else(|| BuildError::missing_field("test_case"))?,
        })
    }
}
