<?php

namespace Seed;

enum EntityEventPayloadEventType: string
{
    case Created = "CREATED";
    case Updated = "UPDATED";
    case Deleted = "DELETED";
    case Preexisting = "PREEXISTING";
}
