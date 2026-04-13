<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class ContainerValue extends JsonSerializableType
{
    /**
     * @var (
     *    'list'
     *   |'optional'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    ContainerValueList
     *   |ContainerValueOptional
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'list'
     *   |'optional'
     *   |'_unknown'
     * ),
     *   value: (
     *    ContainerValueList
     *   |ContainerValueOptional
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param ContainerValueList $list
     * @return ContainerValue
     */
    public static function list(ContainerValueList $list): ContainerValue
    {
        return new ContainerValue([
            'type' => 'list',
            'value' => $list,
        ]);
    }

    /**
     * @param ContainerValueOptional $optional
     * @return ContainerValue
     */
    public static function optional(ContainerValueOptional $optional): ContainerValue
    {
        return new ContainerValue([
            'type' => 'optional',
            'value' => $optional,
        ]);
    }

    /**
     * @return bool
     */
    public function isList_(): bool
    {
        return $this->value instanceof ContainerValueList && $this->type === 'list';
    }

    /**
     * @return ContainerValueList
     */
    public function asList_(): ContainerValueList
    {
        if (!($this->value instanceof ContainerValueList && $this->type === 'list')) {
            throw new Exception(
                "Expected list; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isOptional(): bool
    {
        return $this->value instanceof ContainerValueOptional && $this->type === 'optional';
    }

    /**
     * @return ContainerValueOptional
     */
    public function asOptional(): ContainerValueOptional
    {
        if (!($this->value instanceof ContainerValueOptional && $this->type === 'optional')) {
            throw new Exception(
                "Expected optional; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array
    {
        $result = [];
        $result['type'] = $this->type;

        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);

        switch ($this->type) {
            case 'list':
                $value = $this->asList_()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'optional':
                $value = $this->asOptional()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)) {
                    break;
                }
                if ($this->value instanceof JsonSerializableType) {
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)) {
                    $result = array_merge($this->value, $result);
                }
        }

        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static
    {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)) {
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static
    {
        $args = [];
        if (!array_key_exists('type', $data)) {
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))) {
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }

        $args['type'] = $type;
        switch ($type) {
            case 'list':
                $args['value'] = ContainerValueList::jsonDeserialize($data);
                break;
            case 'optional':
                $args['value'] = ContainerValueOptional::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }

        // @phpstan-ignore-next-line
        return new static($args);
    }
}
