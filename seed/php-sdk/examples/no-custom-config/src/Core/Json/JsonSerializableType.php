<?php

namespace Seed\Core\Json;

use DateTime;
use Exception;
use JsonException;
use ReflectionNamedType;
use ReflectionProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Date;
use Seed\Core\Types\Union;

/**
 * Provides generic serialization and deserialization methods.
 */
abstract class JsonSerializableType implements \JsonSerializable
{
    /** @var array<string, mixed> Extra properties from JSON that don't map to class properties */
    private array $__additionalProperties = [];

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
            $jsonKey = self::getJsonKey($property);
            if ($jsonKey == null) {
                continue;
            }
            $value = $property->getValue($this);

            // Handle DateTime properties
            $dateTypeAttr = $property->getAttributes(Date::class)[0] ?? null;
            if ($dateTypeAttr && $value instanceof DateTime) {
                $dateType = $dateTypeAttr->newInstance()->type;
                $value = ($dateType === Date::TYPE_DATE)
                    ? JsonSerializer::serializeDate($value)
                    : JsonSerializer::serializeDateTime($value);
            }

            // Handle Union annotations
            $unionTypeAttr = $property->getAttributes(Union::class)[0] ?? null;
            if ($unionTypeAttr) {
                $unionType = $unionTypeAttr->newInstance();
                $value = JsonSerializer::serializeUnion($value, $unionType);
            }

            // Handle arrays with type annotations
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if ($arrayTypeAttr && is_array($value)) {
                $arrayType = $arrayTypeAttr->newInstance()->type;
                $value = JsonSerializer::serializeArray($value, $arrayType);
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
        $properties = [];
        $additionalProperties = [];
        foreach ($reflectionClass->getProperties() as $property) {
            $jsonKey = self::getJsonKey($property) ?? $property->getName();
            $properties[$jsonKey] = $property;
        }

        foreach ($data as $jsonKey => $value) {
            if (!isset($properties[$jsonKey])) {
                // This JSON key doesn't map to any class property - add it to additionalProperties
                $additionalProperties[$jsonKey] = $value;
                continue;
            }

            $property = $properties[$jsonKey];

            // Handle Date annotation
            $dateTypeAttr = $property->getAttributes(Date::class)[0] ?? null;
            if ($dateTypeAttr) {
                $dateType = $dateTypeAttr->newInstance()->type;
                if (!is_string($value)) {
                    throw new JsonException("Unexpected non-string type for date.");
                }
                $value = ($dateType === Date::TYPE_DATE)
                    ? JsonDeserializer::deserializeDate($value)
                    : JsonDeserializer::deserializeDateTime($value);
            }

            // Handle Array annotation
            $arrayTypeAttr = $property->getAttributes(ArrayType::class)[0] ?? null;
            if (is_array($value) && $arrayTypeAttr) {
                $arrayType = $arrayTypeAttr->newInstance()->type;
                $value = JsonDeserializer::deserializeArray($value, $arrayType);
            }

            // Handle Union annotations
            $unionTypeAttr = $property->getAttributes(Union::class)[0] ?? null;
            if ($unionTypeAttr) {
                $unionType = $unionTypeAttr->newInstance();
                $value = JsonDeserializer::deserializeUnion($value, $unionType);
            }

            // Handle object
            $type = $property->getType();
            if (is_array($value) && $type instanceof ReflectionNamedType && !$type->isBuiltin()) {
                $value = JsonDeserializer::deserializeObject($value, $type->getName());
            }

            $args[$property->getName()] = $value;
        }

        // Fill in any missing properties with defaults
        foreach ($properties as $property) {
            if (!isset($args[$property->getName()])) {
                $args[$property->getName()] = $property->getDefaultValue() ?? null;
            }
        }

        // @phpstan-ignore-next-line
        $result = new static($args);
        $result->__additionalProperties = $additionalProperties;
        return $result;
    }

    /**
     * Get properties from JSON that weren't mapped to class fields
     * @return array<string, mixed>
     */
    public function getAdditionalProperties(): array
    {
        return $this->__additionalProperties;
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
