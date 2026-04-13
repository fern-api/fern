<?php

namespace Seed\Auth\Types;

enum AuthRefreshTokenRequestGrantType: string
{
    case RefreshToken = "refresh_token";
}
