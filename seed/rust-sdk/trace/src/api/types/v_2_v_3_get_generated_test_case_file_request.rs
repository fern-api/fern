pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct V2V3GetGeneratedTestCaseFileRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub template: Option<V2V3TestCaseTemplate>,
    #[serde(rename = "testCase")]
    pub test_case: V2V3TestCaseV2,
}

impl V2V3GetGeneratedTestCaseFileRequest {
    pub fn builder() -> V2V3GetGeneratedTestCaseFileRequestBuilder {
        <V2V3GetGeneratedTestCaseFileRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2V3GetGeneratedTestCaseFileRequestBuilder {
    template: Option<V2V3TestCaseTemplate>,
    test_case: Option<V2V3TestCaseV2>,
}

impl V2V3GetGeneratedTestCaseFileRequestBuilder {
    pub fn template(mut self, value: V2V3TestCaseTemplate) -> Self {
        self.template = Some(value);
        self
    }

    pub fn test_case(mut self, value: V2V3TestCaseV2) -> Self {
        self.test_case = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2V3GetGeneratedTestCaseFileRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`test_case`](V2V3GetGeneratedTestCaseFileRequestBuilder::test_case)
    pub fn build(self) -> Result<V2V3GetGeneratedTestCaseFileRequest, BuildError> {
        Ok(V2V3GetGeneratedTestCaseFileRequest {
            template: self.template,
            test_case: self
                .test_case
                .ok_or_else(|| BuildError::missing_field("test_case"))?,
        })
    }
}
