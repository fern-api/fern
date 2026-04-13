<?php

namespace Seed\Auth;

enum RefreshTokenRequestGrantType: string
{
    case RefreshToken = "refresh_token";
}
