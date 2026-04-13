<?php

namespace Seed\Auth;

enum AuthRefreshTokenRequestGrantType: string
{
    case RefreshToken = "refresh_token";
}
