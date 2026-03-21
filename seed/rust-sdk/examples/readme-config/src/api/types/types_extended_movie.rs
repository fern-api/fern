pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExtendedMovie {
    #[serde(flatten)]
    pub movie_fields: Movie,
    #[serde(default)]
    pub cast: Vec<String>,
}

impl ExtendedMovie {
    pub fn builder() -> ExtendedMovieBuilder {
        ExtendedMovieBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ExtendedMovieBuilder {
    movie_fields: Option<Movie>,
    cast: Option<Vec<String>>,
}

impl ExtendedMovieBuilder {
    pub fn movie_fields(mut self, value: Movie) -> Self {
        self.movie_fields = Some(value);
        self
    }

    pub fn cast(mut self, value: Vec<String>) -> Self {
        self.cast = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`ExtendedMovie`].
    /// This method will fail if any of the following fields are not set:
    /// - [`movie_fields`](ExtendedMovieBuilder::movie_fields)
    /// - [`cast`](ExtendedMovieBuilder::cast)
    pub fn build(self) -> Result<ExtendedMovie, BuildError> {
        Ok(ExtendedMovie {
            movie_fields: self
                .movie_fields
                .ok_or_else(|| BuildError::missing_field("movie_fields"))?,
            cast: self.cast.ok_or_else(|| BuildError::missing_field("cast"))?,
        })
    }
}
