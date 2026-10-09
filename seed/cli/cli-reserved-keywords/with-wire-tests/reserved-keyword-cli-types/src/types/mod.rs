//! Request and response types for the Reserved Keyword CLI
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 5 types for data representation

pub mod model;
pub mod model_page;
pub mod pagination_metadata;
pub mod model_event;
pub mod created_by;

pub use model::Model;
pub use model_page::ModelPage;
pub use pagination_metadata::PaginationMetadata;
pub use model_event::ModelEvent;
pub use created_by::CreatedBy;

