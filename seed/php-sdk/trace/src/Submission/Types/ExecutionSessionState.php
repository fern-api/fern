<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Types\Language;

class ExecutionSessionState extends JsonSerializableType
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
     * @var value-of<Language> $language
     */
    #[JsonProperty('language')]
    public string $language;

    /**
     * @var value-of<ExecutionSessionStatus> $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @param array{
     *   sessionId: string,
     *   isWarmInstance: bool,
     *   language: value-of<Language>,
     *   status: value-of<ExecutionSessionStatus>,
     *   lastTimeContacted?: ?string,
     *   awsTaskId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->lastTimeContacted = $values['lastTimeContacted'] ?? null;$this->sessionId = $values['sessionId'];$this->isWarmInstance = $values['isWarmInstance'];$this->awsTaskId = $values['awsTaskId'] ?? null;$this->language = $values['language'];$this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
