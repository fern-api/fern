pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type")]
#[non_exhaustive]
pub enum CustomFiles {
    #[serde(rename = "basic")]
    #[non_exhaustive]
    Basic {
        #[serde(rename = "methodName")]
        #[serde(default)]
        method_name: String,
        signature: NonVoidFunctionSignature,
        #[serde(rename = "additionalFiles")]
        #[serde(default)]
        additional_files: HashMap<Language, Files>,
        #[serde(rename = "basicTestCaseTemplate")]
        #[serde(default)]
        basic_test_case_template: BasicTestCaseTemplate,
    },

    #[serde(rename = "custom")]
    #[non_exhaustive]
    Custom { value: HashMap<Language, Files> },

    /// Catch-all variant for unrecognized discriminant values.
    /// If the server sends a discriminant not recognized by the current SDK
    /// version, the raw payload is captured here so callers can still inspect it.
    #[serde(untagged)]
    __Unknown(serde_json::Value),
}

impl CustomFiles {
    pub fn basic(
        method_name: String,
        signature: NonVoidFunctionSignature,
        additional_files: HashMap<Language, Files>,
        basic_test_case_template: BasicTestCaseTemplate,
    ) -> Self {
        Self::Basic {
            method_name,
            signature,
            additional_files,
            basic_test_case_template,
        }
    }

    pub fn custom(value: HashMap<Language, Files>) -> Self {
        Self::Custom { value }
    }

    pub fn unknown(value: serde_json::Value) -> Self {
        Self::__Unknown(value)
    }
}
