<?php

namespace Seed\Ast\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

/**
* This type allows us to test a circular reference with a union type (see FieldValue).
 */
class ObjectFieldValue extends SerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty("name")]
    public string $name;

    /**
     * @var mixed $value
     */
    #[JsonProperty("value")]
    public mixed $value;

    /**
     * @param string $name
     * @param mixed $value
     */
    public function __construct(
        string $name,
        mixed $value,
    ) {
        $this->name = $name;
        $this->value = $value;
    }
}
