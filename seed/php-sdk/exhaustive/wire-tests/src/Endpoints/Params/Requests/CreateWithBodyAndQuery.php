<?php

namespace Seed\Endpoints\Params\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\Object\Types\ObjectWithRequiredField;

class CreateWithBodyAndQuery extends JsonSerializableType
{
    /**
     * @var ?string $fields
     */
    public ?string $fields;

    /**
     * @var ObjectWithRequiredField $body
     */
    public ObjectWithRequiredField $body;

    /**
     * @param array{
     *   body: ObjectWithRequiredField,
     *   fields?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->fields = $values['fields'] ?? null;
        $this->body = $values['body'];
    }
}
