<?php

namespace Seed\User\Events\Metadata\Requests;

use Seed\Core\Json\SerializableType;

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
