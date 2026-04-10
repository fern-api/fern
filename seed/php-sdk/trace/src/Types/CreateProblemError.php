<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\GenericCreateProblemError;
use Seed\Core\Json\JsonProperty;

class CreateProblemError extends JsonSerializableType
{
    use GenericCreateProblemError;

    /**
     * @var value-of<CreateProblemErrorType> $type
     */
    #[JsonProperty('_type')]
    public string $type;

    /**
     * @param array{
     *   message: string,
     *   type: string,
     *   stacktrace: string,
     *   type: value-of<CreateProblemErrorType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->message = $values['message'];
        $this->type = $values['type'];
        $this->stacktrace = $values['stacktrace'];
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
