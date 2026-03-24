pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct GetFunctionSignatureResponse2 {
    #[serde(rename = "functionByLanguage")]
    #[serde(default)]
    pub function_by_language: HashMap<Language, String>,
}

impl GetFunctionSignatureResponse2 {
    pub fn builder() -> GetFunctionSignatureResponse2Builder {
        GetFunctionSignatureResponse2Builder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct GetFunctionSignatureResponse2Builder {
    function_by_language: Option<HashMap<Language, String>>,
}

impl GetFunctionSignatureResponse2Builder {
    pub fn function_by_language(mut self, value: HashMap<Language, String>) -> Self {
        self.function_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`GetFunctionSignatureResponse2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`function_by_language`](GetFunctionSignatureResponse2Builder::function_by_language)
    pub fn build(self) -> Result<GetFunctionSignatureResponse2, BuildError> {
        Ok(GetFunctionSignatureResponse2 {
            function_by_language: self
                .function_by_language
                .ok_or_else(|| BuildError::missing_field("function_by_language"))?,
        })
    }
}
