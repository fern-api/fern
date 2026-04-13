<?php

namespace Seed;

enum MigrationStatus: string
{
    case Running = "RUNNING";
    case Failed = "FAILED";
    case Finished = "FINISHED";
}
