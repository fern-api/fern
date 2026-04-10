pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq, Hash)]
pub struct MultipartformRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<Color>,
    #[serde(rename = "maybeColor")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_color: Option<Color>,
    #[serde(rename = "colorList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color_list: Option<Vec<Color>>,
    #[serde(rename = "maybeColorList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_color_list: Option<Vec<Color>>,
}
impl MultipartformRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
    let mut form = reqwest::multipart::Form::new();

    if let Some(ref value) = self.color {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("color", json_str);
        }
    }

    if let Some(ref value) = self.maybe_color {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("maybeColor", json_str);
        }
    }

    if let Some(ref value) = self.color_list {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("colorList", json_str);
        }
    }

    if let Some(ref value) = self.maybe_color_list {
        if let Ok(json_str) = serde_json::to_string(value) {
            form = form.text("maybeColorList", json_str);
        }
    }

    form
}
}

impl MultipartformRequest {
    pub fn builder() -> MultipartformRequestBuilder {
        <MultipartformRequestBuilder as Default>::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MultipartformRequestBuilder {
    color: Option<Color>,
    maybe_color: Option<Color>,
    color_list: Option<Vec<Color>>,
    maybe_color_list: Option<Vec<Color>>,
}

impl MultipartformRequestBuilder {
    pub fn color(mut self, value: Color) -> Self {
        self.color = Some(value);
        self
    }

    pub fn maybe_color(mut self, value: Color) -> Self {
        self.maybe_color = Some(value);
        self
    }

    pub fn color_list(mut self, value: Vec<Color>) -> Self {
        self.color_list = Some(value);
        self
    }

    pub fn maybe_color_list(mut self, value: Vec<Color>) -> Self {
        self.maybe_color_list = Some(value);
        self
    }

    /// Consumes the builder and constructs a [`MultipartformRequest`].
    pub fn build(self) -> Result<MultipartformRequest, BuildError> {
        Ok(MultipartformRequest {
            color: self.color,
            maybe_color: self.maybe_color,
            color_list: self.color_list,
            maybe_color_list: self.maybe_color_list,
        })
    }
}
