<?php

namespace Seed;

enum Environments
 : string {
    case Production = "https://api.example.com";
    case Staging = "https://staging-api.example.com";
}
