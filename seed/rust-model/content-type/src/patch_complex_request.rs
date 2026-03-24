pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PatchComplexRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub active: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, serde_json::Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub nickname: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bio: Option<String>,
    #[serde(rename = "profileImageUrl")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub profile_image_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub settings: Option<HashMap<String, serde_json::Value>>,
}

impl PatchComplexRequest {
    pub fn builder() -> PatchComplexRequestBuilder {
        PatchComplexRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct PatchComplexRequestBuilder {
    name: Option<String>,
    age: Option<i64>,
    active: Option<bool>,
    metadata: Option<HashMap<String, serde_json::Value>>,
    tags: Option<Vec<String>>,
    email: Option<String>,
    nickname: Option<String>,
    bio: Option<String>,
    profile_image_url: Option<String>,
    settings: Option<HashMap<String, serde_json::Value>>,
}

impl PatchComplexRequestBuilder {
    pub fn name(mut self, value: impl Into<String>) -> Self {
        self.name = Some(value.into());
        self
    }

    pub fn age(mut self, value: i64) -> Self {
        self.age = Some(value);
        self
    }

    pub fn active(mut self, value: bool) -> Self {
        self.active = Some(value);
        self
    }

    pub fn metadata(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.metadata = Some(value);
        self
    }

    pub fn tags(mut self, value: Vec<String>) -> Self {
        self.tags = Some(value);
        self
    }

    pub fn email(mut self, value: impl Into<String>) -> Self {
        self.email = Some(value.into());
        self
    }

    pub fn nickname(mut self, value: impl Into<String>) -> Self {
        self.nickname = Some(value.into());
        self
    }

    pub fn bio(mut self, value: impl Into<String>) -> Self {
        self.bio = Some(value.into());
        self
    }

    pub fn profile_image_url(mut self, value: impl Into<String>) -> Self {
        self.profile_image_url = Some(value.into());
        self
    }

    pub fn settings(mut self, value: HashMap<String, serde_json::Value>) -> Self {
        self.settings = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`PatchComplexRequest`].
    pub fn build(self) -> Result<PatchComplexRequest, BuildError> {
        Ok(PatchComplexRequest {
            name: self.name,
            age: self.age,
            active: self.active,
            metadata: self.metadata,
            tags: self.tags,
            email: self.email,
            nickname: self.nickname,
            bio: self.bio,
            profile_image_url: self.profile_image_url,
            settings: self.settings,
        })
    }
}

