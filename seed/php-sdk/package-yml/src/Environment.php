<?php

namespace Seed;

enum Environment: string {
    case Production = "https://acme.co";
    case Staging = "https://acme-staging.co";
  }