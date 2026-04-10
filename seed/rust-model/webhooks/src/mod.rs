//! Request and response types for the Webhooks
//!
//! This module contains all data structures used for API communication,
//! including request bodies, response types, and shared models.
//!
//! ## Type Categories
//!
//! - **Model Types**: 4 types for data representation

pub mod user_created_payload;
pub mod order_completed_payload;
pub mod payment_notification_payload;
pub mod refund_processed_payload;

pub use user_created_payload::UserCreatedPayload;
pub use order_completed_payload::OrderCompletedPayload;
pub use payment_notification_payload::PaymentNotificationPayload;
pub use refund_processed_payload::RefundProcessedPayload;

