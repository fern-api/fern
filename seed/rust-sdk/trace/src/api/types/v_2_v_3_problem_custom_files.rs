pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
pub enum CustomFiles2 {
    #[serde(rename = "basic")]
    #[non_exhaustive]
    Basic {
        #[serde(rename = "methodName")]
        #[serde(default)]
        method_name: String,
        signature: NonVoidFunctionSignature2,
        #[serde(rename = "additionalFiles")]
        #[serde(default)]
        additional_files: HashMap<Language, Files2>,
        #[serde(rename = "basicTestCaseTemplate")]
        #[serde(default)]
        basic_test_case_template: BasicTestCaseTemplate2,
    },

    #[serde(rename = "custom")]
    #[non_exhaustive]
    Custom { value: HashMap<Language, Files2> },
}

impl CustomFiles2 {
    pub fn basic(
        method_name: String,
        signature: NonVoidFunctionSignature2,
        additional_files: HashMap<Language, Files2>,
        basic_test_case_template: BasicTestCaseTemplate2,
    ) -> Self {
        Self::Basic {
            method_name,
            signature,
            additional_files,
            basic_test_case_template,
        }
    }

    pub fn custom(value: HashMap<Language, Files2>) -> Self {
        Self::Custom { value }
    }
}
