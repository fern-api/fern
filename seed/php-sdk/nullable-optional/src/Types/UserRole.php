<?php

namespace Seed\Types;

enum UserRole: string
{
    case Admin = "ADMIN";
    case User = "USER";
    case Guest = "GUEST";
    case Moderator = "MODERATOR";
}
