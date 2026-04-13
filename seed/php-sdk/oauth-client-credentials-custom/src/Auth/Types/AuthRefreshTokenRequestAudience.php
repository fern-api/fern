<?php

namespace Seed\Auth\Types;

enum AuthRefreshTokenRequestAudience: string
{
    case HttpsApiExampleCom = "https://api.example.com";
}
