<?php

namespace Seed\Auth\Types;

enum AuthGetTokenWithClientCredentialsRequestAudience: string
{
    case HttpsApiExampleCom = "https://api.example.com";
}
