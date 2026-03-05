<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\PlantOrder;

class CreatePlantOrderRequest extends JsonSerializableType
{
    /**
     * @var PlantOrder $body
     */
    public PlantOrder $body;

    /**
     * @param array{
     *   body: PlantOrder,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->body = $values['body'];
    }
}
