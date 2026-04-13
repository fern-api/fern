<?php

namespace Seed\UserEventsMetadata\Requests;

use Seed\Core\Json\JsonSerializableType;

class UserEventsMetadataGetMetadataRequest extends JsonSerializableType
{
    /**
     * @var string $id
     */
    public string $id;

    /**
     * @param array{
     *   id: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->id = $values['id'];
    }
}
