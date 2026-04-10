pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct V2FunctionImplementationForMultipleLanguages {
    #[serde(rename = "codeByLanguage")]
    #[serde(default)]
    pub code_by_language: HashMap<String, V2FunctionImplementation>,
}

impl V2FunctionImplementationForMultipleLanguages {
    pub fn builder() -> V2FunctionImplementationForMultipleLanguagesBuilder {
        <V2FunctionImplementationForMultipleLanguagesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct V2FunctionImplementationForMultipleLanguagesBuilder {
    code_by_language: Option<HashMap<String, V2FunctionImplementation>>,
}

impl V2FunctionImplementationForMultipleLanguagesBuilder {
    pub fn code_by_language(mut self, value: HashMap<String, V2FunctionImplementation>) -> Self {
        self.code_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`V2FunctionImplementationForMultipleLanguages`].
    /// This method will fail if any of the following fields are not set:
    /// - [`code_by_language`](V2FunctionImplementationForMultipleLanguagesBuilder::code_by_language)
    pub fn build(self) -> Result<V2FunctionImplementationForMultipleLanguages, BuildError> {
        Ok(V2FunctionImplementationForMultipleLanguages {
            code_by_language: self
                .code_by_language
                .ok_or_else(|| BuildError::missing_field("code_by_language"))?,
        })
    }
}
