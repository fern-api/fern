//! Request and response types for the Webhook Audience Test
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 3 types for data representation

pub mod public_payload;
pub mod private_payload;
pub mod no_audience_payload;

pub use public_payload::PublicPayload;
pub use private_payload::PrivatePayload;
pub use no_audience_payload::NoAudiencePayload;

