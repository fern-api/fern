<?php

namespace Seed\LangServer\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class LangServerResponse extends JsonSerializableType
{
    /**
     * @var mixed $response
     */
    #[JsonProperty('response')]
    public mixed $response;

    /**
     * @param array{
     *   response: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->response = $values['response'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
