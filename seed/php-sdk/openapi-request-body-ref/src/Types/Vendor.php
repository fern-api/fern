<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Vendor extends JsonSerializableType
{
    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?value-of<VendorStatus> $status
     */
    #[JsonProperty('status')]
    public ?string $status;

    /**
     * @var ?UpdateVendorRequest $updateRequest
     */
    #[JsonProperty('update_request')]
    public ?UpdateVendorRequest $updateRequest;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   status?: ?value-of<VendorStatus>,
     *   updateRequest?: ?UpdateVendorRequest,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
        $this->name = $values['name'];
        $this->status = $values['status'] ?? null;
        $this->updateRequest = $values['updateRequest'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
