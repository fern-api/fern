pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct CreateMovieRequest {
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub rating: f64,
}

impl CreateMovieRequest {
    pub fn builder() -> CreateMovieRequestBuilder {
        CreateMovieRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct CreateMovieRequestBuilder {
    title: Option<String>,
    rating: Option<f64>,
}

impl CreateMovieRequestBuilder {
    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    pub fn rating(mut self, value: f64) -> Self {
        self.rating = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`CreateMovieRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`title`](CreateMovieRequestBuilder::title)
    /// - [`rating`](CreateMovieRequestBuilder::rating)
    pub fn build(self) -> Result<CreateMovieRequest, BuildError> {
        Ok(CreateMovieRequest {
            title: self
                .title
                .ok_or_else(|| BuildError::missing_field("title"))?,
            rating: self
                .rating
                .ok_or_else(|| BuildError::missing_field("rating"))?,
        })
    }
}
