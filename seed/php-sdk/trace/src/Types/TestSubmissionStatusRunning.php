<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class TestSubmissionStatusRunning extends JsonSerializableType
{
    /**
     * @var ?value-of<RunningSubmissionState> $value
     */
    #[JsonProperty('value')]
    public ?string $value;

    /**
     * @param array{
     *   value?: ?value-of<RunningSubmissionState>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
