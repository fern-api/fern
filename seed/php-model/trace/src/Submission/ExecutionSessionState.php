<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Commons\Language;

class ExecutionSessionState extends SerializableType
{
    /**
     * @var ?string $lastTimeContacted
     */
    #[JsonProperty('lastTimeContacted')]
    public ?string $lastTimeContacted;

    /**
     * @var string $sessionId The auto-generated session id. Formatted as a uuid.
     */
    #[JsonProperty('sessionId')]
    public string $sessionId;

    /**
     * @var bool $isWarmInstance
     */
    #[JsonProperty('isWarmInstance')]
    public bool $isWarmInstance;

    /**
     * @var ?string $awsTaskId
     */
    #[JsonProperty('awsTaskId')]
    public ?string $awsTaskId;

    /**
     * @var Language $language
     */
    #[JsonProperty('language')]
    public Language $language;

    /**
     * @var ExecutionSessionStatus $status
     */
    #[JsonProperty('status')]
    public ExecutionSessionStatus $status;

    /**
     * @param array{
     *   lastTimeContacted?: ?string,
     *   sessionId: string,
     *   isWarmInstance: bool,
     *   awsTaskId?: ?string,
     *   language: Language,
     *   status: ExecutionSessionStatus,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->lastTimeContacted = $values['lastTimeContacted'] ?? null;
        $this->sessionId = $values['sessionId'];
        $this->isWarmInstance = $values['isWarmInstance'];
        $this->awsTaskId = $values['awsTaskId'] ?? null;
        $this->language = $values['language'];
        $this->status = $values['status'];
    }
}
