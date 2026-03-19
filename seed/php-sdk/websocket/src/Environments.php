<?php

namespace Seed;

enum Environments: string
{
    case Production = "https://production.example.com";
    case Staging = "https://staging.example.com";
}
