<?php

namespace Seed\Auth\Types;

enum GetTokenRequestAudience: string
{
    case HttpsApiExampleCom = "https://api.example.com";
}
