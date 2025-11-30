<?php

namespace Seed;

enum Environments
 : string {
    case Production = "https://production.com/api";
    case Staging = "https://staging.com/api";
}
