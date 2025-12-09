<?php

namespace Seed\Types\Types;

enum MigrationStatus
 : string {
    case Running = "RUNNING";
    case Failed = "FAILED";
    case Finished = "FINISHED";
}
