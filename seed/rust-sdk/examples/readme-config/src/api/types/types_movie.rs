pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Movie {
    #[serde(default)]
    pub id: MovieId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prequel: Option<MovieId>,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub from: String,
    /// The rating scale is one to five stars
    #[serde(default)]
    pub rating: f64,
    pub r#type: String,
    #[serde(default)]
    pub tag: Tag,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub book: Option<String>,
    #[serde(default)]
    pub metadata: HashMap<String, serde_json::Value>,
    #[serde(default)]
    pub revenue: i64,
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
    prequel: Option<MovieId>,
    title: Option<String>,
    from: Option<String>,
    rating: Option<f64>,
    r#type: Option<String>,
    tag: Option<Tag>,
    book: Option<String>,
    metadata: Option<HashMap<String, serde_json::Value>>,
    revenue: Option<i64>,
}

impl MovieBuilder {
    pub fn id(mut self, value: MovieId) -> Self {
        self.id = Some(value);
        self
    }

    pub fn prequel(mut self, value: MovieId) -> Self {
        self.prequel = Some(value);
        self
    }

    pub fn title(mut self, value: impl Into<String>) -> Self {
        self.title = Some(value.into());
        self
    }

    pub fn from(mut self, value: impl Into<String>) -> Self {
        self.from = Some(value.into());
        self
    }

    pub fn rating(mut self, value: f64) -> Self {
        self.rating = Some(value);
        self
    }

    pub fn r#type(mut self, value: impl Into<String>) -> Self {
        self.r#type = Some(value.into());
        self
    }

    pub fn tag(mut self, value: Tag) -> Self {
        self.tag = Some(value);
        self
    }

    pub fn book(mut self, value: impl Into<String>) -> Self {
        self.book = Some(value.into());
        self
    }

    pub fn metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn revenue(mut self, value: i64) -> Self {
        self.revenue = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`Movie`].
    /// This method will fail if any of the following fields are not set:
    /// - [`id`](MovieBuilder::id)
    /// - [`title`](MovieBuilder::title)
    /// - [`from`](MovieBuilder::from)
    /// - [`rating`](MovieBuilder::rating)
    /// - [`r#type`](MovieBuilder::r#type)
    /// - [`tag`](MovieBuilder::tag)
    /// - [`metadata`](MovieBuilder::metadata)
    /// - [`revenue`](MovieBuilder::revenue)
    pub fn build(self) -> Result<Movie, BuildError> {
        Ok(Movie {
            id: self.id.ok_or_else(|| BuildError::missing_field("id"))?,
            prequel: self.prequel,
            title: self
                .title
                .ok_or_else(|| BuildError::missing_field("title"))?,
            from: self.from.ok_or_else(|| BuildError::missing_field("from"))?,
            rating: self
                .rating
                .ok_or_else(|| BuildError::missing_field("rating"))?,
            r#type: self
                .r#type
                .ok_or_else(|| BuildError::missing_field("r#type"))?,
            tag: self.tag.ok_or_else(|| BuildError::missing_field("tag"))?,
            book: self.book,
            metadata: self
                .metadata
                .ok_or_else(|| BuildError::missing_field("metadata"))?,
            revenue: self
                .revenue
                .ok_or_else(|| BuildError::missing_field("revenue"))?,
        })
    }
}
