<?php

namespace Seed\Core\Types;

use Seed\Core\Json\JsonSerializableType;

abstract class DiscriminatedUnion extends JsonSerializableType
{
    public const string TYPE_KEY = 'type';
    public const string VALUE_KEY = 'value';

    /**
     * @var string type
     */
    public string $type;

    /**
     * @var mixed value
     */
    public mixed $value;
}
