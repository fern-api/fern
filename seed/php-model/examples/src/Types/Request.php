<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Request extends JsonSerializableType
{
    /**
     * @var mixed $request
     */
    #[JsonProperty('request')]
    public mixed $request;

    /**
     * @param array{
     *   request: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->request = $values['request'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
