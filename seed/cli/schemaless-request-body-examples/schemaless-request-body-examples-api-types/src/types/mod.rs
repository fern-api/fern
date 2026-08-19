//! Request and response types for the Schemaless Request Body Examples API
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Request/Response Types**: 4 types for API operations

pub mod create_plant_response;
pub mod update_plant_response;
pub mod create_plant_with_schema_response;
pub mod create_plant_with_schema_request;

pub use create_plant_response::CreatePlantResponse;
pub use update_plant_response::UpdatePlantResponse;
pub use create_plant_with_schema_response::CreatePlantWithSchemaResponse;
pub use create_plant_with_schema_request::CreatePlantWithSchemaRequest;

