pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct Chunk {
    #[serde(default)]
    pub index: i64,
    #[serde(default)]
    pub text: String,
}

impl Chunk {
    pub fn builder() -> ChunkBuilder {
        <ChunkBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct ChunkBuilder {
    index: Option<i64>,
    text: Option<String>,
}

impl ChunkBuilder {
    pub fn index(mut self, value: i64) -> Self {
        self.index = Some(value);
        self
    }

    pub fn text(mut self, value: impl Into<String>) -> Self {
        self.text = Some(value.into());
        self
    }

    /// Consumes the builder and constructs a [`Chunk`].
    /// This method will fail if any of the following fields are not set:
    /// - [`index`](ChunkBuilder::index)
    /// - [`text`](ChunkBuilder::text)
    pub fn build(self) -> Result<Chunk, BuildError> {
        Ok(Chunk {
            index: self
                .index
                .ok_or_else(|| BuildError::missing_field("index"))?,
            text: self.text.ok_or_else(|| BuildError::missing_field("text"))?,
        })
    }
}
