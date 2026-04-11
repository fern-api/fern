---
title: Changelog
description: Recent updates, new features, and improvements to the Acme API.
slug: changelog
---

# Changelog

Stay up to date with the latest changes and improvements to the Acme API and SDKs.

## March 2025

### Precision v3 pipeline release

- **New pipeline:** Precision v3 now available with support for 70+ data formats
- **Multi-source joins:** Combine data from multiple inputs in a single request
- **Advanced validation:** Enhanced data quality checks with detailed error reports
- **Custom transforms:** Use inline transformation rules for complex processing
- **Improved accuracy:** More accurate entity extraction and classification across all languages

### SDK updates

- **TypeScript SDK v2.4.0:** Added v3 pipeline support and batch processing helpers
- **Python SDK v1.8.0:** Added v3 pipeline support and async streaming improvements

## February 2025

### Workflow Engine (General Availability)

- **Orchestration:** Build multi-step automated workflows with sub-300ms step latency
- **Tool integration:** Workflows can invoke external APIs and services at each step
- **Knowledge bases:** Connect documents and data sources for context-aware processing
- **Webhook events:** Receive notifications when workflows start, complete, or encounter errors

### API improvements

- **New endpoint:** `POST /v1/data/export` for bulk data export
- **New parameter:** `batch_size` (1-1000) for controlling processing throughput
- **New output format:** `arrow` for Apache Arrow IPC format

## January 2025

### Pipeline library enhancements

- **Sharing controls:** Set pipelines as public, unlisted, or private
- **Usage analytics:** Track how often shared pipelines are used
- **Categories:** Browse pipeline library by domain, format, and use case

### Platform updates

- **EU data residency:** Enterprise customers can now process data in EU regions
- **SSO support:** SAML-based single sign-on for Enterprise workspaces
- **Audit logs:** Track API key usage and administrative actions

## December 2024

### Express v1 improvements

- **Lower latency:** Time-to-first-byte reduced by 30% compared to previous version
- **Better multilingual:** Improved handling for mixed-language inputs
- **Higher throughput:** Increased concurrent request limits for all plans

### SDK updates

- **TypeScript SDK v2.3.0:** Added WebSocket streaming support
- **Python SDK v1.7.0:** Added async client and improved type hints
- **Go SDK v0.5.0:** Added streaming support and error type improvements

## November 2024

### Batch Processing API (General Availability)

- **Automatic batching:** Process large datasets with automatic chunking and parallelization
- **Priority queues:** Assign priority levels to batch jobs for scheduling control
- **Progress tracking:** Monitor batch job progress via API or Dashboard
- **Result aggregation:** Automatically combine results from batch operations

### Custom Pipelines

- **User-defined pipelines:** Create custom processing pipelines with configurable steps
- **Template library:** Start from pre-built pipeline templates for common use cases
- **Per-pipeline settings:** Apply different configurations to different pipelines
- **API management:** Full CRUD operations for pipeline definitions

## October 2024

### Express v1 release

- **New pipeline:** Optimized for low-latency applications like real-time queries
- **Sub-100ms latency:** Time-to-first-byte for small inputs
- **32 format support:** Handle diverse data formats with automatic detection
- **50% cost reduction:** Lower cost per request compared to Standard v2

### File Processing API

- **Document processing:** Extract and transform data from uploaded documents
- **Variable formats:** Support for PDF, DOCX, CSV, and more
- **High quality:** Structured output with confidence scores

## September 2024

### API versioning

- **Versioned endpoints:** All new endpoints follow `/v1/` versioning
- **Deprecation policy:** 6-month notice before removing deprecated endpoints
- **Migration guides:** Step-by-step guides for each breaking change

### Rate limiting improvements

- **Per-endpoint limits:** Different rate limits for different endpoint categories
- **Better headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` on all responses
- **Retry-After header:** Included on 429 responses with exact wait time
