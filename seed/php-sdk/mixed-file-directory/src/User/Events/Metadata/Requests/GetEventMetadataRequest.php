<?php

namespace Seed\User\Events\Metadata\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetEventMetadataRequest extends JsonSerializableType
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
    )
    {
        $this->id = $values['id'];
    }
}
