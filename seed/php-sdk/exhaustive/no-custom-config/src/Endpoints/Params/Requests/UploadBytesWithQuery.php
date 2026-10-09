<?php

namespace Seed\Endpoints\Params\Requests;

use Seed\Core\Json\JsonSerializableType;

class UploadBytesWithQuery extends JsonSerializableType
{
    /**
     * @var ?string $fields
     */
    public ?string $fields;

    /**
     * @param array{
     *   fields?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->fields = $values['fields'] ?? null;
    }
}
