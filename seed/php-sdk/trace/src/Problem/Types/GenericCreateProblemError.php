<?php

namespace Seed\Problem\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class GenericCreateProblemError extends JsonSerializableType
{
    /**
     * @var string $message
     */
    #[JsonProperty('message')]
    public string $message;

    /**
     * @var string $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var string $stacktrace
     */
    #[JsonProperty('stacktrace')]
    public string $stacktrace;

    /**
     * @param array{
     *   message: string,
     *   type: string,
     *   stacktrace: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->message = $values['message'];$this->type = $values['type'];$this->stacktrace = $values['stacktrace'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
