<?php

namespace Seed\LangServer;

use Seed\Core\Json\SerializableType;
use Seed\Core\Json\JsonProperty;

class LangServerRequest extends SerializableType
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
}
