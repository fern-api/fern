# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## [0.8.0] - 2024-01-25
= Fix: Enums in inlined requests send the appropriate value.
  ```python
  class Operand(str, Enum):
    greater_than = ">"
    equal_to = "="
  
  # Previously the SDK would just send the operand directly
  def endpoint(self, *, operand: Operand): 
    httpx.post(json={"operand": operand})
  
  # Now, the SDK will send the value of the enum
  def endpoint(self, *, operand: Operand): 
    httpx.post(json={"operand": operand.value})
  ```

## [0.7.7] - 2024-01-21

- Chore: Intialize this changelog