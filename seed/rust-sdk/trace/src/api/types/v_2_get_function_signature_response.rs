pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2GetFunctionSignatureResponse {
    #[serde(rename = "functionByLanguage")]
    #[serde(default)]
    pub function_by_language: HashMap<String, String>,
}

impl V2GetFunctionSignatureResponse {
    pub fn builder() -> V2GetFunctionSignatureResponseBuilder {
        <V2GetFunctionSignatureResponseBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2GetFunctionSignatureResponseBuilder {
    function_by_language: Option<HashMap<String, String>>,
}

impl V2GetFunctionSignatureResponseBuilder {
    pub fn function_by_language(mut self, value: HashMap<String, String>) -> Self {
        self.function_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2GetFunctionSignatureResponse`].
    /// This method will fail if any of the following fields are not set:
    /// - [`function_by_language`](V2GetFunctionSignatureResponseBuilder::function_by_language)
    pub fn build(self) -> Result<V2GetFunctionSignatureResponse, BuildError> {
        Ok(V2GetFunctionSignatureResponse {
            function_by_language: self
                .function_by_language
                .ok_or_else(|| BuildError::missing_field("function_by_language"))?,
        })
    }
}
