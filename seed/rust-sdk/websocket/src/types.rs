use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendEvent {
    pub send_text: String, // TODO: Implement proper type
    pub send_param: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendSnakeCase {
    pub send_text: String, // TODO: Implement proper type
    pub send_param: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiveEvent {
    pub alpha: String, // TODO: Implement proper type
    pub beta: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiveSnakeCase {
    pub receive_text: String, // TODO: Implement proper type
    pub receive_int: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendEvent2 {
    pub send_text_2: String, // TODO: Implement proper type
    pub send_param_2: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiveEvent2 {
    pub gamma: String, // TODO: Implement proper type
    pub delta: String, // TODO: Implement proper type
    pub epsilon: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReceiveEvent3 {
    pub receive_text_3: String, // TODO: Implement proper type
}

