<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\CustomTestCasesUnsupported;
use Seed\Core\Json\JsonProperty;

class InvalidRequestCauseOne extends JsonSerializableType
{
    use CustomTestCasesUnsupported;

    /**
     * @var value-of<InvalidRequestCauseOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   problemId: string,
     *   submissionId: string,
     *   type: value-of<InvalidRequestCauseOneType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
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
