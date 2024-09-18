<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;
use Seed\Submission\ExecutionSessionStatus;

class ExecutionSessionState extends SerializableType
{
    #[JsonProperty("sessionId")]
    /**
     * @var string $sessionId The auto-generated session id. Formatted as a uuid.
     */
    public string $sessionId;

    #[JsonProperty("isWarmInstance")]
    /**
     * @var bool $isWarmInstance
     */
    public bool $isWarmInstance;

    #[JsonProperty("language")]
    /**
     * @var Language $language
     */
    public Language $language;

    #[JsonProperty("status")]
    /**
     * @var ExecutionSessionStatus $status
     */
    public ExecutionSessionStatus $status;

    #[JsonProperty("lastTimeContacted")]
    /**
     * @var ?string $lastTimeContacted
     */
    public ?string $lastTimeContacted;

    #[JsonProperty("awsTaskId")]
    /**
     * @var ?string $awsTaskId
     */
    public ?string $awsTaskId;

    /**
     * @param string $sessionId The auto-generated session id. Formatted as a uuid.
     * @param bool $isWarmInstance
     * @param Language $language
     * @param ExecutionSessionStatus $status
     * @param ?string $lastTimeContacted
     * @param ?string $awsTaskId
     */
    public function __construct(
        string $sessionId,
        bool $isWarmInstance,
        Language $language,
        ExecutionSessionStatus $status,
        ?string $lastTimeContacted = null,
        ?string $awsTaskId = null,
    ) {
        $this->sessionId = $sessionId;
        $this->isWarmInstance = $isWarmInstance;
        $this->language = $language;
        $this->status = $status;
        $this->lastTimeContacted = $lastTimeContacted;
        $this->awsTaskId = $awsTaskId;
    }
}
