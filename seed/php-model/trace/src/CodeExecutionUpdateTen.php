<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\FinishedResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateTen extends JsonSerializableType
{
    use FinishedResponse;

    /**
     * @var value-of<CodeExecutionUpdateTenType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   type: value-of<CodeExecutionUpdateTenType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
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
