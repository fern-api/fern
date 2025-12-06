<?php

namespace Seed\Types;

enum MigrationStatus
 : string {
    case Running = "RUNNING";
    case Failed = "FAILED";
    case Finished = "FINISHED";
}
