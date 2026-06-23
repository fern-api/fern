<?php

namespace Seed\Package\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

class DependencyItem extends JsonSerializableType
{
    /**
     * @var (
     *    'known'
     *   |'unknown'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    KnownDependency
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'known'
     *   |'unknown'
     *   |'_unknown'
     * ),
     *   value: (
     *    KnownDependency
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
     * @param KnownDependency $known
     * @return DependencyItem
     */
    public static function known(KnownDependency $known): DependencyItem
    {
        return new DependencyItem([
            'type' => 'known',
            'value' => $known,
        ]);
    }

    /**
     * @param KnownDependency $unknown
     * @return DependencyItem
     */
    public static function unknown(KnownDependency $unknown): DependencyItem
    {
        return new DependencyItem([
            'type' => 'unknown',
            'value' => $unknown,
        ]);
    }

    /**
     * @return bool
     */
    public function isKnown(): bool
    {
        return $this->value instanceof KnownDependency && $this->type === 'known';
    }

    /**
     * @return KnownDependency
     */
    public function asKnown(): KnownDependency
    {
        if (!($this->value instanceof KnownDependency && $this->type === 'known')) {
            throw new Exception(
                "Expected known; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isUnknown(): bool
    {
        return $this->value instanceof KnownDependency && $this->type === 'unknown';
    }

    /**
     * @return KnownDependency
     */
    public function asUnknown(): KnownDependency
    {
        if (!($this->value instanceof KnownDependency && $this->type === 'unknown')) {
            throw new Exception(
                "Expected unknown; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'known':
                $value = $this->asKnown()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'unknown':
                $value = $this->asUnknown()->jsonSerialize();
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
            case 'known':
                $args['value'] = KnownDependency::jsonDeserialize($data);
                break;
            case 'unknown':
                $args['value'] = KnownDependency::jsonDeserialize($data);
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
