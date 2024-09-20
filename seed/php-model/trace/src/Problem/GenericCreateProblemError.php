<?php

namespace Seed\Problem;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class GenericCreateProblemError extends SerializableType
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
    ) {
        $this->message = $values['message'];
        $this->type = $values['type'];
        $this->stacktrace = $values['stacktrace'];
    }
}
