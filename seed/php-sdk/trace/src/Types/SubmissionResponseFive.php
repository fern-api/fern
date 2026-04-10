<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\TerminatedResponse;
use Seed\Core\Json\JsonProperty;

class SubmissionResponseFive extends JsonSerializableType
{
    use TerminatedResponse;

    /**
     * @var value-of<SubmissionResponseFiveType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: value-of<SubmissionResponseFiveType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
