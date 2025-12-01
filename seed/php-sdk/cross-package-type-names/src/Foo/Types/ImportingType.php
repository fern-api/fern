<?php

namespace Seed\Foo\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ImportingType extends JsonSerializableType
{
    /**
     * @var string $imported
     */
    #[JsonProperty('imported')]
    public string $imported;

    /**
     * @param array{
     *   imported: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->imported = $values['imported'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
