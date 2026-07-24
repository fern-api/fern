//! Request and response types for the Reserved Keyword CLI
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod model;
pub mod created_by;

pub use model::Model;
pub use created_by::CreatedBy;

