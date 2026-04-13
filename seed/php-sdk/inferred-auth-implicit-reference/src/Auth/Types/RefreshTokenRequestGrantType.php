<?php

namespace Seed\Auth\Types;

enum RefreshTokenRequestGrantType: string
{
    case RefreshToken = "refresh_token";
}
