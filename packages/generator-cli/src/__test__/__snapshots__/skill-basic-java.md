---
name: basic-java-sdk
description: >-
  Use the Basic Java SDK (`io.intercom:intercom-java`) to call the Basic API:
  installation.
  Use when writing Java code that talks to Basic, or when a user asks how to
  do something with the Basic Java SDK.
---

# Basic Java SDK

## When to use this skill

Use this skill whenever the task involves calling the Basic API from Java. Prefer the SDK over hand-written HTTP requests: it handles authentication, serialization, errors, retries and timeouts for you.

## Installation

### Gradle

Add the dependency in your `build.gradle` file:

```groovy
dependencies {
  implementation 'io.intercom:intercom-java:3.0.0'
}
```

### Maven

Add the dependency in your `pom.xml` file:

```xml
<dependency>
  <groupId>io.intercom</groupId>
  <artifactId>intercom-java</artifactId>
  <version>3.0.0</version>
</dependency>
```

## Rules

- Read credentials from environment variables or a secrets manager; never hard-code API keys or tokens in source code.
- Use the typed request and response objects exported by the SDK instead of building raw JSON.
- Catch the SDK's typed errors and inspect the status code and body instead of matching on error messages.
- Do not edit generated SDK files; configure behavior through client options (base URL, headers, timeouts, retries).
- If a method or type is missing from this skill, look it up in the reference before falling back to raw HTTP.