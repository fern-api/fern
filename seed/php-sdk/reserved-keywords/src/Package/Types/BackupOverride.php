<?php

namespace Seed\Package\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class BackupOverride extends JsonSerializableType
{
    /**
     * @var string $model
     */
    #[JsonProperty('model')]
    public string $model;

    /**
     * @param array{
     *   model: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->model = $values['model'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
