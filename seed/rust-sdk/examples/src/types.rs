use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Identifier {
    pub type_: String, // TODO: Implement proper type
    pub value: String, // TODO: Implement proper type
    pub label: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BasicType {
    Primitive,
    Literal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ComplexType {
    Object,
    Union,
    Unknown,
}

pub type Tag = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Metadata {
    pub id: String, // TODO: Implement proper type
    pub data: String, // TODO: Implement proper type
    pub json_string: String, // TODO: Implement proper type
}

pub type Filename = String; // TODO: Implement proper type

pub type MovieId = String; // TODO: Implement proper type

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movie {
    pub id: String, // TODO: Implement proper type
    pub prequel: String, // TODO: Implement proper type
    pub title: String, // TODO: Implement proper type
    pub from: String, // TODO: Implement proper type
    pub rating: String, // TODO: Implement proper type
    pub type_: String, // TODO: Implement proper type
    pub tag: String, // TODO: Implement proper type
    pub book: String, // TODO: Implement proper type
    pub metadata: String, // TODO: Implement proper type
    pub revenue: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Actor {
    pub name: String, // TODO: Implement proper type
    pub id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Actress {
    pub name: String, // TODO: Implement proper type
    pub id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StuntDouble {
    pub name: String, // TODO: Implement proper type
    pub actor_or_actress_id: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExtendedMovie {
    pub cast: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Moment {
    pub id: String, // TODO: Implement proper type
    pub date: String, // TODO: Implement proper type
    pub datetime: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct File {
    pub name: String, // TODO: Implement proper type
    pub contents: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Directory {
    pub name: String, // TODO: Implement proper type
    pub files: String, // TODO: Implement proper type
    pub directories: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node {
    pub name: String, // TODO: Implement proper type
    pub nodes: String, // TODO: Implement proper type
    pub trees: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tree {
    pub nodes: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExceptionInfo {
    pub exception_type: String, // TODO: Implement proper type
    pub exception_message: String, // TODO: Implement proper type
    pub exception_stacktrace: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MigrationStatus {
    Running,
    Failed,
    Finished,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Migration {
    pub name: String, // TODO: Implement proper type
    pub status: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    pub request: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Response {
    pub response: String, // TODO: Implement proper type
    pub identifiers: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResponseType {
    pub type_: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub type_: String, // TODO: Implement proper type
    pub name: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BigEntity {
    pub cast_member: String, // TODO: Implement proper type
    pub extended_movie: String, // TODO: Implement proper type
    pub entity: String, // TODO: Implement proper type
    pub metadata: String, // TODO: Implement proper type
    pub common_metadata: String, // TODO: Implement proper type
    pub event_info: String, // TODO: Implement proper type
    pub data: String, // TODO: Implement proper type
    pub migration: String, // TODO: Implement proper type
    pub exception: String, // TODO: Implement proper type
    pub test: String, // TODO: Implement proper type
    pub node: String, // TODO: Implement proper type
    pub directory: String, // TODO: Implement proper type
    pub moment: String, // TODO: Implement proper type
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CronJob {
    pub expression: String, // TODO: Implement proper type
}

