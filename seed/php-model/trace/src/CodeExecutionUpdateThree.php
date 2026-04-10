<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\StoppedResponse;
use Seed\Core\Json\JsonProperty;

class CodeExecutionUpdateThree extends JsonSerializableType
{
    use StoppedResponse;

    /**
     * @var value-of<CodeExecutionUpdateThreeType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   type: value-of<CodeExecutionUpdateThreeType>,
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
