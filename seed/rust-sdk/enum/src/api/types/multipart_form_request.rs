pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct MultipartFormRequest {
    pub color: Color,
    #[serde(rename = "maybeColor")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_color: Option<Color>,
    #[serde(rename = "colorList")]
    #[serde(default)]
    pub color_list: Vec<Color>,
    #[serde(rename = "maybeColorList")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_color_list: Option<Vec<Color>>,
}
impl MultipartFormRequest {
    pub fn to_multipart(self) -> reqwest::multipart::Form {
        let mut form = reqwest::multipart::Form::new();

        if let Ok(json_str) = serde_json::to_string(&self.color) {
            form = form.text("color", json_str);
        }

        if let Some(ref value) = self.maybe_color {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybeColor", json_str);
            }
        }

        if let Ok(json_str) = serde_json::to_string(&self.color_list) {
            form = form.text("colorList", json_str);
        }

        if let Some(ref value) = self.maybe_color_list {
            if let Ok(json_str) = serde_json::to_string(value) {
                form = form.text("maybeColorList", json_str);
            }
        }

        form
    }
}

impl MultipartFormRequest {
    pub fn builder() -> MultipartFormRequestBuilder {
        MultipartFormRequestBuilder::default()
    }
}

#[derive(Clone, PartialEq, Default, Debug)]
#[non_exhaustive]
pub struct MultipartFormRequestBuilder {
    color: Option<Color>,
    maybe_color: Option<Color>,
    color_list: Option<Vec<Color>>,
    maybe_color_list: Option<Vec<Color>>,
}

impl MultipartFormRequestBuilder {
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

    /// Consumes the builder and constructs a [`MultipartFormRequest`].
    /// This method will fail if any of the following fields are not set:
    /// - [`color`](MultipartFormRequestBuilder::color)
    /// - [`color_list`](MultipartFormRequestBuilder::color_list)
    pub fn build(self) -> Result<MultipartFormRequest, BuildError> {
        Ok(MultipartFormRequest {
            color: self
                .color
                .ok_or_else(|| BuildError::missing_field("color"))?,
            maybe_color: self.maybe_color,
            color_list: self
                .color_list
                .ok_or_else(|| BuildError::missing_field("color_list"))?,
            maybe_color_list: self.maybe_color_list,
        })
    }
}
