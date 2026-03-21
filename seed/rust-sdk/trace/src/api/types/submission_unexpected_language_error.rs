pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct UnexpectedLanguageError {
    #[serde(rename = "expectedLanguage")]
    pub expected_language: Language,
    #[serde(rename = "actualLanguage")]
    pub actual_language: Language,
}

impl UnexpectedLanguageError {
    pub fn builder() -> UnexpectedLanguageErrorBuilder {
        UnexpectedLanguageErrorBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct UnexpectedLanguageErrorBuilder {
    expected_language: Option<Language>,
    actual_language: Option<Language>,
}

impl UnexpectedLanguageErrorBuilder {
    pub fn expected_language(mut self, value: Language) -> Self {
        self.expected_language = Some(value);
        self
    }

    pub fn actual_language(mut self, value: Language) -> Self {
        self.actual_language = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`UnexpectedLanguageError`].
    /// This method will fail if any of the following fields are not set:
    /// - [`expected_language`](UnexpectedLanguageErrorBuilder::expected_language)
    /// - [`actual_language`](UnexpectedLanguageErrorBuilder::actual_language)
    pub fn build(self) -> Result<UnexpectedLanguageError, BuildError> {
        Ok(UnexpectedLanguageError {
            expected_language: self
                .expected_language
                .ok_or_else(|| BuildError::missing_field("expected_language"))?,
            actual_language: self
                .actual_language
                .ok_or_else(|| BuildError::missing_field("actual_language"))?,
        })
    }
}
