pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetFunctionSignatureResponse {
    #[serde(rename = "functionByLanguage")]
    #[serde(default)]
    pub function_by_language: HashMap<Language, String>,
}

impl GetFunctionSignatureResponse {
    pub fn builder() -> GetFunctionSignatureResponseBuilder {
        <GetFunctionSignatureResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetFunctionSignatureResponseBuilder {
    function_by_language: Option<HashMap<Language, String>>,
}

impl GetFunctionSignatureResponseBuilder {
    pub fn function_by_language(mut self, value: HashMap<Language, String>) -> Self {
        self.function_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetFunctionSignatureResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`function_by_language`](GetFunctionSignatureResponseBuilder::function_by_language)
    pub fn build(self) -> Result<GetFunctionSignatureResponse, BuildError> {
        Ok(GetFunctionSignatureResponse {
            function_by_language: self
                .function_by_language
                .ok_or_else(|| BuildError::missing_field("function_by_language"))?,
        })
    }
}
