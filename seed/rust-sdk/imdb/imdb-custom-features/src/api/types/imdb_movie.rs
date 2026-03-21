pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct Movie {
    #[serde(default)]
    pub id: MovieId,
    #[serde(default)]
    pub title: String,
    /// The rating scale is one to five stars
    #[serde(default)]
    pub rating: f64,
}

impl Movie {
    pub fn builder() -> MovieBuilder {
        MovieBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MovieBuilder {
    id: Option<MovieId>,
    title: Option<String>,
    rating: Option<f64>,
}

impl MovieBuilder {
    pub fn id(mut self, value: MovieId) -> Self {
        self.id = Some(value);
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    pub fn rating(mut self, value: f64) -> Self {
        self.rating = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Movie`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](MovieBuilder::id)
    /// - [`title`](MovieBuilder::title)
    /// - [`rating`](MovieBuilder::rating)
    pub fn build(self) -> Result<Movie, BuildError> {
        Ok(Movie {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            title: self
                .title
                .ok_or_else(|| BuildError::missing_field("title"))?,
            rating: self
                .rating
                .ok_or_else(|| BuildError::missing_field("rating"))?,
        })
    }
}
