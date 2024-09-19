<?php

namespace Seed\Submission\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Types\Language;

class ExecutionSessionState extends SerializableType
{
    /**
     * @var string $sessionId The auto-generated session id. Formatted as a uuid.
     */
    #[JsonProperty("sessionId")]
    public string $sessionId;

    /**
     * @var bool $isWarmInstance
     */
    #[JsonProperty("isWarmInstance")]
    public bool $isWarmInstance;

    /**
     * @var Language $language
     */
    #[JsonProperty("language")]
    public Language $language;

    /**
     * @var ExecutionSessionStatus $status
     */
    #[JsonProperty("status")]
    public ExecutionSessionStatus $status;

    /**
     * @var ?string $lastTimeContacted
     */
    #[JsonProperty("lastTimeContacted")]
    public ?string $lastTimeContacted;

    /**
     * @var ?string $awsTaskId
     */
    #[JsonProperty("awsTaskId")]
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
