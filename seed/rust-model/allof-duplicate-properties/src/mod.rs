//! Request and response types for the AllOf Duplicate Properties Test
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 2 types for data representation

pub mod order_base;
pub mod plant_order;

pub use order_base::OrderBase;
pub use plant_order::PlantOrder;

