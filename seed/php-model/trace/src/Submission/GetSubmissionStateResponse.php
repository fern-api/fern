<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;
use Seed\Core\DateType;
use DateTime;

class GetSubmissionStateResponse extends SerializableType
{
    #[JsonProperty("submission")]
    /**
     * @var string $submission
     */
    public string $submission;

    #[JsonProperty("language")]
    /**
     * @var Language $language
     */
    public Language $language;

    #[JsonProperty("submissionTypeState")]
    /**
     * @var mixed $submissionTypeState
     */
    public mixed $submissionTypeState;

    #[JsonProperty("timeSubmitted"), DateType(DateType::TYPE_DATETIME)]
    /**
     * @var ?DateTime $timeSubmitted
     */
    public ?DateTime $timeSubmitted;

    /**
     * @param string $submission
     * @param Language $language
     * @param mixed $submissionTypeState
     * @param ?DateTime $timeSubmitted
     */
    public function __construct(
        string $submission,
        Language $language,
        mixed $submissionTypeState,
        ?DateTime $timeSubmitted = null,
    ) {
        $this->submission = $submission;
        $this->language = $language;
        $this->submissionTypeState = $submissionTypeState;
        $this->timeSubmitted = $timeSubmitted;
    }
}
