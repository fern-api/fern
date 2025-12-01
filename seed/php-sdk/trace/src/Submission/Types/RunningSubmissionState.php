<?php

namespace Seed\Submission\Types;

enum RunningSubmissionState
 : string {
    case QueueingSubmission = "QUEUEING_SUBMISSION";
    case KillingHistoricalSubmissions = "KILLING_HISTORICAL_SUBMISSIONS";
    case WritingSubmissionToFile = "WRITING_SUBMISSION_TO_FILE";
    case CompilingSubmission = "COMPILING_SUBMISSION";
    case RunningSubmission = "RUNNING_SUBMISSION";
}
