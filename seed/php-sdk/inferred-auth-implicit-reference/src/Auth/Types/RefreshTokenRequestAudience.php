<?php

namespace Seed\Auth\Types;

enum RefreshTokenRequestAudience: string
{
    case HttpsApiExampleCom = "https://api.example.com";
}
