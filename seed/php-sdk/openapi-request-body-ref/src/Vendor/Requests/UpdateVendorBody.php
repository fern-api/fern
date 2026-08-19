<?php

namespace Seed\Vendor\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\UpdateVendorRequest;

class UpdateVendorBody extends JsonSerializableType
{
    /**
     * @var UpdateVendorRequest $body
     */
    public UpdateVendorRequest $body;

    /**
     * @param array{
     *   body: UpdateVendorRequest,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
