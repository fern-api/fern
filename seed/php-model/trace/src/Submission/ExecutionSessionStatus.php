<?php

namespace Seed\Submission;

enum ExecutionSessionStatus
 : string {
    case CreatingContainer = "CREATING_CONTAINER";
    case ProvisioningContainer = "PROVISIONING_CONTAINER";
    case PendingContainer = "PENDING_CONTAINER";
    case RunningContainer = "RUNNING_CONTAINER";
    case LiveContainer = "LIVE_CONTAINER";
    case FailedToLaunch = "FAILED_TO_LAUNCH";
}
