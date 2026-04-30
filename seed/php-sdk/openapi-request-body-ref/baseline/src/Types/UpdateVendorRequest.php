<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UpdateVendorRequest extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?value-of<UpdateVendorRequestStatus> $status
     */
    #[JsonProperty('status')]
    public ?string $status;

    /**
     * @param array{
     *   name: string,
     *   status?: ?value-of<UpdateVendorRequestStatus>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->status = $values['status'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
