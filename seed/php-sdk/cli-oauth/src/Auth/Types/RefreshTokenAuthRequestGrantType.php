<?php

namespace Seed\Auth\Types;

enum RefreshTokenAuthRequestGrantType: string
{
    case RefreshToken = "refresh_token";
}
