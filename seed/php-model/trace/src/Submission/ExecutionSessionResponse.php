<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Commons\Language;

class ExecutionSessionResponse extends JsonSerializableType
{
    /**
     * @var string $sessionId
     */
    #[JsonProperty('sessionId')]
    public string $sessionId;

    /**
     * @var ?string $executionSessionUrl
     */
    #[JsonProperty('executionSessionUrl')]
    public ?string $executionSessionUrl;

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
     *   language: value-of<Language>,
     *   status: value-of<ExecutionSessionStatus>,
     *   executionSessionUrl?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->sessionId = $values['sessionId'];$this->executionSessionUrl = $values['executionSessionUrl'] ?? null;$this->language = $values['language'];$this->status = $values['status'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
