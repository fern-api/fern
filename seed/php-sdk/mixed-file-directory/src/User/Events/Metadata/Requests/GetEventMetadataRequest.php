<?php

namespace Seed\User\Events\Metadata\Requests;

use Seed\Core\SerializableType;

class GetEventMetadataRequest extends SerializableType
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
