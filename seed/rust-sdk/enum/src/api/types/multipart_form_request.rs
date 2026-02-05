pub use crate::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct MultipartFormRequest {
    pub color: Color,
    #[serde(rename = "maybeColor")]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub maybe_color: Option<Color>,
    #[serde(rename = "colorList")]
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