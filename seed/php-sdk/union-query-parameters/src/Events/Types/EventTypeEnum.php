<?php

namespace Seed\Events\Types;

enum EventTypeEnum: string
{
    case GroupCreated = "group.created";
    case UserUpdated = "user.updated";
}
