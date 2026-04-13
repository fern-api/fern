<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class Status extends JsonSerializableType
{
    /**
     * @var (
     *    'active'
     *   |'archived'
     *   |'soft-deleted'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    StatusActive
     *   |StatusArchived
     *   |StatusSoftDeleted
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'active'
     *   |'archived'
     *   |'soft-deleted'
     *   |'_unknown'
     * ),
     *   value: (
     *    StatusActive
     *   |StatusArchived
     *   |StatusSoftDeleted
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
     * @param StatusActive $active
     * @return Status
     */
    public static function active(StatusActive $active): Status
    {
        return new Status([
            'type' => 'active',
            'value' => $active,
        ]);
    }

    /**
     * @param StatusArchived $archived
     * @return Status
     */
    public static function archived(StatusArchived $archived): Status
    {
        return new Status([
            'type' => 'archived',
            'value' => $archived,
        ]);
    }

    /**
     * @param StatusSoftDeleted $softDeleted
     * @return Status
     */
    public static function softDeleted(StatusSoftDeleted $softDeleted): Status
    {
        return new Status([
            'type' => 'soft-deleted',
            'value' => $softDeleted,
        ]);
    }

    /**
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->value instanceof StatusActive && $this->type === 'active';
    }

    /**
     * @return StatusActive
     */
    public function asActive(): StatusActive
    {
        if (!($this->value instanceof StatusActive && $this->type === 'active')) {
            throw new Exception(
                "Expected active; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isArchived(): bool
    {
        return $this->value instanceof StatusArchived && $this->type === 'archived';
    }

    /**
     * @return StatusArchived
     */
    public function asArchived(): StatusArchived
    {
        if (!($this->value instanceof StatusArchived && $this->type === 'archived')) {
            throw new Exception(
                "Expected archived; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isSoftDeleted(): bool
    {
        return $this->value instanceof StatusSoftDeleted && $this->type === 'soft-deleted';
    }

    /**
     * @return StatusSoftDeleted
     */
    public function asSoftDeleted(): StatusSoftDeleted
    {
        if (!($this->value instanceof StatusSoftDeleted && $this->type === 'soft-deleted')) {
            throw new Exception(
                "Expected soft-deleted; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'active':
                $value = $this->asActive()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'archived':
                $value = $this->asArchived()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'soft-deleted':
                $value = $this->asSoftDeleted()->jsonSerialize();
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
            case 'active':
                $args['value'] = StatusActive::jsonDeserialize($data);
                break;
            case 'archived':
                $args['value'] = StatusArchived::jsonDeserialize($data);
                break;
            case 'soft-deleted':
                $args['value'] = StatusSoftDeleted::jsonDeserialize($data);
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
