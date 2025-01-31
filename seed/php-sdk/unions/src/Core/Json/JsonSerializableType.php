<?php

namespace Seed\Core\Json;

use DateTime;
use Exception;
use JsonException;
use ReflectionNamedType;
use ReflectionProperty;
use Seed\Core\Json\JsonSkip;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Date;
use Seed\Core\Types\Discriminant;
use Seed\Core\Types\DiscriminatedUnion;
use Seed\Core\Types\Union;

/**
 * Provides generic serialization and deserialization methods.
 */
abstract class JsonSerializableType implements \JsonSerializable
{
    /**
     * Serializes the object to a JSON string.
     *
     * @return string JSON-encoded string representation of the object.
     * @throws Exception If encoding fails.
     */
    public function toJson(): string
    {
        $serializedObject = $this->jsonSerialize();
        $encoded = JsonEncoder::encode($serializedObject);
        if (!$encoded) {
            throw new Exception("Could not encode type");
        }
        return $encoded;
    }

    /**
     * Serializes the object to an array.
     *
     * @return mixed[] Array representation of the object.
     * @throws JsonException If serialization fails.
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $reflectionClass = new \ReflectionClass($this);

        foreach ($reflectionClass->getProperties() as $property) {
            $jsonSkipAttr = $property->getAttributes(JsonSkip::class)[0] ?? null;
            if ($jsonSkipAttr) {
                continue;
            }

            $jsonKey = self::getJsonKey($property);
            if ($jsonKey == null) {
                continue;
            }
            $value = $property->getValue($this);

            $dateType = null;
            $arrayType = null;
            $unionType = null;

            // Handle discriminated union
            $discriminantAttr = $property->getAttributes(Discriminant::class)[0] ?? null;
            if ($discriminantAttr && $this instanceof DiscriminatedUnion) {
                if (count($discriminantAttr->getArguments()) !== 1) {
                    throw new \InvalidArgumentException(
                        "Discriminant attribute must have exactly one argument for a subclass of DiscriminatedUnion"
                    );
                }

                $result[$jsonKey] = $value;
                $existingTypes = $discriminantAttr->getArguments()[0];
                $discriminatedType = $existingTypes[$value] ?? null;

                if ($discriminatedType instanceof Date) {
                    $dateType = $discriminatedType->type;
                } elseif ($discriminatedType instanceof ArrayType) {
                    $arrayType = $discriminatedType->type;
                } elseif ($discriminatedType instanceof Union) {
                    $unionType = $discriminatedType;
                }

                $jsonKey = $value;
                $value = $this->value;
            }

            // Handle DateTime properties
            $dateTypeAttr = $property->getAttributes(Date::class)[0] ?? null;
            if (($dateType || $dateTypeAttr) && $value instanceof DateTime) {
                if ($dateTypeAttr && is_null($dateType)) {
                    $dateType = $dateTypeAttr->newInstance()->type;
                }
                $value = ($dateType === Date::TYPE_DATE)
                    ? JsonSerializer::serializeDate($value)
                    : JsonSerializer::serializeDateTime($value);
            }

            // Handle Union annotations
            $unionTypeAttr = $property->getAttributes(Union::class)[0] ?? null;
            if ($unionType || $unionTypeAttr) {
                if ($unionTypeAttr && is_null($unionType)) {
                    $unionType = $unionTypeAttr->newInstance();
                }
                if ($unionType) {
                    $value = JsonSerializer::serializeUnion($value, $unionType);
                }
            }

            // Handle arrays with type annotations
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if (($arrayType || $arrayTypeAttr) && is_array($value)) {
                if ($arrayTypeAttr && is_null($arrayType)) {
                    $arrayType = $arrayTypeAttr->newInstance()->type;
                }
                if ($arrayType) {
                    $value = JsonSerializer::serializeArray($value, $arrayType);
                }
            }

            // Handle object
            if (is_object($value)) {
                $value = JsonSerializer::serializeObject($value);
            }

            if ($value !== null) {
                $result[$jsonKey] = $value;
            }
        }

        return $result;
    }

    /**
     * Deserializes a JSON string into an instance of the calling class.
     *
     * @param string $json JSON string to deserialize.
     * @return static Deserialized object.
     * @throws JsonException If decoding fails or the result is not an array.
     * @throws Exception If deserialization fails.
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new JsonException("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * Deserializes an array into an instance of the calling class.
     *
     * @param array<string, mixed> $data Array data to deserialize.
     * @return static Deserialized object.
     * @throws JsonException If deserialization fails.
     */
    public static function jsonDeserialize(array $data): static
    {
        $reflectionClass = new \ReflectionClass(static::class);
        $constructor = $reflectionClass->getConstructor();

        if ($constructor === null) {
            throw new JsonException("No constructor found.");
        }

        $args = [];
        foreach ($reflectionClass->getProperties() as $property) {
            $jsonSkipAttr = $property->getAttributes(JsonSkip::class)[0] ?? null;
            if ($jsonSkipAttr) {
                continue;
            }

            $jsonKey = self::getJsonKey($property) ?? $property->getName();
            $propertyName = $property->getName();

            if (array_key_exists($jsonKey, $data)) {
                $value = $data[$jsonKey];

                $dateType = null;
                $arrayType = null;
                $unionType = null;
                $typeName = null;

                // Handle discriminated union
                $discriminantAttr = $property->getAttributes(Discriminant::class)[0] ?? null;
                if ($discriminantAttr && $reflectionClass->isSubclassOf(DiscriminatedUnion::class)) {
                    if (count($discriminantAttr->getArguments()) !== 1) {
                        throw new \InvalidArgumentException(
                            "Discriminant attribute must have exactly one argument for a subclass of DiscriminatedUnion"
                        );
                    }

                    $propertyName = DiscriminatedUnion::VALUE_KEY;
                    $existingTypes = $discriminantAttr->getArguments()[0];
                    if (is_string($value) && array_key_exists($value, $existingTypes)) {
                        $args[DiscriminatedUnion::TYPE_KEY] = $value;
                        $discriminatedType = $existingTypes[$value];

                        if (is_string($value) && array_key_exists($value, $data)) {
                            if ($discriminatedType instanceof Date) {
                                $dateType = $discriminatedType->type;
                            } elseif ($discriminatedType instanceof ArrayType) {
                                $arrayType = $discriminatedType->type;
                            } elseif ($discriminatedType instanceof Union) {
                                $unionType = $discriminatedType;
                            }

                            $value = $data[$value];
                            $typeName = $discriminatedType;
                        } else {
                            // Inline properties are only possible with objects
                            $value = JsonDeserializer::deserializeObject($data, $discriminatedType);
                        }
                    } else {
                        $args[DiscriminatedUnion::TYPE_KEY] = '_unknown';
                    }
                }

                // Handle Date annotation
                $dateTypeAttr = $property->getAttributes(Date::class)[0] ?? null;
                if ($dateType || $dateTypeAttr) {
                    if ($dateTypeAttr && is_null($dateType)) {
                        $dateType = $dateTypeAttr->newInstance()->type;
                    }
                    if (!is_string($value)) {
                        throw new JsonException("Unexpected non-string type for date.");
                    }
                    $value = ($dateType === Date::TYPE_DATE)
                        ? JsonDeserializer::deserializeDate($value)
                        : JsonDeserializer::deserializeDateTime($value);
                }

                // Handle Array annotation
                $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
                if (is_array($value) && ($arrayTypeAttr || $arrayType)) {
                    if ($arrayTypeAttr && is_null($arrayType)) {
                        $arrayType = $arrayTypeAttr->newInstance()->type;
                    }
                    if ($arrayType) {
                        $value = JsonDeserializer::deserializeArray($value, $arrayType);
                    }
                }

                // Handle Union annotations
                $unionTypeAttr = $property->getAttributes(Union::class)[0] ?? null;
                if ($unionType || $unionTypeAttr) {
                    if ($unionTypeAttr && is_null($unionType)) {
                        $unionType = $unionTypeAttr->newInstance();
                    }
                    if ($unionType) {
                        $value = JsonDeserializer::deserializeUnion($value, $unionType);
                    }
                }

                // Handle object
                $type = $property->getType();
                if (is_array($value) && ($typeName || $type instanceof ReflectionNamedType && !$type->isBuiltin())) {
                    if (($type instanceof ReflectionNamedType && !$type->isBuiltin()) && is_null($typeName)) {
                        $typeName = $type->getName();
                    }
                    $value = JsonDeserializer::deserializeObject($value, $typeName);
                }

                $args[$propertyName] = $value;
            } else {
                $defaultValue = $property->getDefaultValue() ?? null;
                $args[$propertyName] = $defaultValue;
            }
        }
        // @phpstan-ignore-next-line
        return new static($args);
    }

    /**
     * Retrieves the JSON key associated with a property.
     *
     * @param ReflectionProperty $property The reflection property.
     * @return ?string The JSON key, or null if not available.
     */
    private static function getJsonKey(ReflectionProperty $property): ?string
    {
        $jsonPropertyAttr = $property->getAttributes(JsonProperty::class)[0] ?? null;
        return $jsonPropertyAttr?->newInstance()?->name;
    }
}
