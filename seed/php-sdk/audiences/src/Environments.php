<?php

namespace Seed;

enum Environments
 : string {
    case EnvironmentA = "https://api.example.a.com";
    case EnvironmentB = "https://api.example.b.com";
}
