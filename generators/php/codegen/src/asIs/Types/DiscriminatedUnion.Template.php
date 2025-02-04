<?php

namespace <%= namespace%>;

use <%= coreNamespace%>\Json\JsonSerializableType;

abstract class DiscriminatedUnion extends JsonSerializableType
{
    public const string TYPE_KEY = 'type';
    public const string VALUE_KEY = 'value';

    /**
    * @var string type
    */
    public string $type;

    /**
    * @var mixed type
    */
    public mixed $value;
}
