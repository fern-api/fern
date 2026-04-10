pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct FunctionImplementationForMultipleLanguages {
    #[serde(rename = "codeByLanguage")]
    #[serde(default)]
    pub code_by_language: HashMap<Language, FunctionImplementation>,
}

impl FunctionImplementationForMultipleLanguages {
    pub fn builder() -> FunctionImplementationForMultipleLanguagesBuilder {
        <FunctionImplementationForMultipleLanguagesBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct FunctionImplementationForMultipleLanguagesBuilder {
    code_by_language: Option<HashMap<Language, FunctionImplementation>>,
}

impl FunctionImplementationForMultipleLanguagesBuilder {
    pub fn code_by_language(mut self, value: HashMap<Language, FunctionImplementation>) -> Self {
        self.code_by_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`FunctionImplementationForMultipleLanguages`].
    /// This method will fail if any of the following fields are not set:
    /// - [`code_by_language`](FunctionImplementationForMultipleLanguagesBuilder::code_by_language)
    pub fn build(self) -> Result<FunctionImplementationForMultipleLanguages, BuildError> {
        Ok(FunctionImplementationForMultipleLanguages {
            code_by_language: self
                .code_by_language
                .ok_or_else(|| BuildError::missing_field("code_by_language"))?,
        })
    }
}
