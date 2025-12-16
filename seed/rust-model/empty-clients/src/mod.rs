//! Request and response types for the EmptyClients
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 4 types for data representation

pub mod level_1_level_2_types_person;
pub mod level_1_level_2_types_address;
pub mod level_1_types_person;
pub mod level_1_types_address;

pub use level_1_level_2_types_person::Person;
pub use level_1_level_2_types_address::Address;
pub use level_1_types_person::Person2;
pub use level_1_types_address::Address2;

