pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct FunctionImplementationForMultipleLanguages2 {
    #[serde(rename = "codeByLanguage")]
    #[serde(default)]
    pub code_by_language: HashMap<Language, FunctionImplementation2>,
}

impl FunctionImplementationForMultipleLanguages2 {
    pub fn builder() -> FunctionImplementationForMultipleLanguages2Builder {
        <FunctionImplementationForMultipleLanguages2Builder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FunctionImplementationForMultipleLanguages2Builder {
    code_by_language: Option<HashMap<Language, FunctionImplementation2>>,
}

impl FunctionImplementationForMultipleLanguages2Builder {
    pub fn code_by_language(mut self, value: HashMap<Language, FunctionImplementation2>) -> Self {
        self.code_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FunctionImplementationForMultipleLanguages2`].
    /// This method will fail if any of the following fields are not set:
    /// - [`code_by_language`](FunctionImplementationForMultipleLanguages2Builder::code_by_language)
    pub fn build(self) -> Result<FunctionImplementationForMultipleLanguages2, BuildError> {
        Ok(FunctionImplementationForMultipleLanguages2 {
            code_by_language: self
                .code_by_language
                .ok_or_else(|| BuildError::missing_field("code_by_language"))?,
        })
    }
}
