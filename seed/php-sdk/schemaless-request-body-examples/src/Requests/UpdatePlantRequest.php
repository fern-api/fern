<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;

class UpdatePlantRequest extends JsonSerializableType
{
    /**
     * @var mixed $body
     */
    public mixed $body;

    /**
     * @param array{
     *   body: mixed,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
