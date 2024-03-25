# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v38

- (Feature): Add support for multipart file upload examples. The examples will contain 
  a filename as well as an optional absolute filepath to a real file on disk. 

  The absolute filepath on disk is not relevenat for the SDK generators, but relevant
  for the mock server and docs so that they can use the real file. 


