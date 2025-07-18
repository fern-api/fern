use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Error {
    pub category: String, // TODO: Implement proper type
    pub code: String, // TODO: Implement proper type
    pub detail: String, // TODO: Implement proper type
    pub field: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorCategory {
    ApiError,
    AuthenticationError,
    InvalidRequestError,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorCode {
    InternalServerError,
    Unauthorized,
    Forbidden,
    BadRequest,
    Conflict,
    Gone,
    UnprocessableEntity,
    NotImplemented,
    BadGateway,
    ServiceUnavailable,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PutResponse {
    pub errors: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BadObjectRequestInfo {
    pub message: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectWithDocs {
    pub string: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WeatherReport {
    Sunny,
    Cloudy,
    Raining,
    Snowing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectWithOptionalField {
    pub string: String, // TODO: Implement proper type
    pub integer: String, // TODO: Implement proper type
    pub long: String, // TODO: Implement proper type
    pub double: String, // TODO: Implement proper type
    pub bool_: String, // TODO: Implement proper type
    pub datetime: String, // TODO: Implement proper type
    pub date: String, // TODO: Implement proper type
    pub uuid: String, // TODO: Implement proper type
    pub base_64: String, // TODO: Implement proper type
    pub list: String, // TODO: Implement proper type
    pub set: String, // TODO: Implement proper type
    pub map: String, // TODO: Implement proper type
    pub bigint: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectWithRequiredField {
    pub string: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ObjectWithMapOfMap {
    pub map: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NestedObjectWithOptionalField {
    pub string: String, // TODO: Implement proper type
    pub nested_object: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NestedObjectWithRequiredField {
    pub string: String, // TODO: Implement proper type
    pub nested_object: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoubleOptional {
    pub optional_alias: String, // TODO: Implement proper type
}

pub type OptionalAlias = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dog {
    pub name: String, // TODO: Implement proper type
    pub likes_to_woof: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cat {
    pub name: String, // TODO: Implement proper type
    pub likes_to_meow: String, // TODO: Implement proper type
}

