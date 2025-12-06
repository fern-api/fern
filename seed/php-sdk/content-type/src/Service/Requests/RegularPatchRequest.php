<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class RegularPatchRequest extends JsonSerializableType
{
    /**
     * @var ?string $field1
     */
    #[JsonProperty('field1')]
    public ?string $field1;

    /**
     * @var ?int $field2
     */
    #[JsonProperty('field2')]
    public ?int $field2;

    /**
     * @param array{
     *   field1?: ?string,
     *   field2?: ?int,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->field1 = $values['field1'] ?? null;$this->field2 = $values['field2'] ?? null;
    }
}
