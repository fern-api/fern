<?php

namespace Seed\Migration;

enum MigrationStatus
 : string {
    case Running = "RUNNING";
    case Failed = "FAILED";
    case Finished = "FINISHED";
}
