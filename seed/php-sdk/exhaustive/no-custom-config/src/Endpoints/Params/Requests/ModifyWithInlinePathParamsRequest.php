<?php

namespace Seed\Endpoints\Params\Requests;

use Seed\Core\Json\JsonSerializableType;

class ModifyWithInlinePathParamsRequest extends JsonSerializableType
{
    /**
     * @var string $body
     */
    public string $body;

    /**
     * @param array{
     *   body: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
