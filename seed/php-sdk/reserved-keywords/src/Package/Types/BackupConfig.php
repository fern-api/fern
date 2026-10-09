<?php

namespace Seed\Package\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

class BackupConfig extends JsonSerializableType
{
    /**
     * @var (
     *    'override'
     *   |'fallback'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    BackupOverride
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'override'
     *   |'fallback'
     *   |'_unknown'
     * ),
     *   value: (
     *    BackupOverride
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
     * @param BackupOverride $override
     * @return BackupConfig
     */
    public static function override(BackupOverride $override): BackupConfig
    {
        return new BackupConfig([
            'type' => 'override',
            'value' => $override,
        ]);
    }

    /**
     * @param BackupOverride $fallback
     * @return BackupConfig
     */
    public static function fallback(BackupOverride $fallback): BackupConfig
    {
        return new BackupConfig([
            'type' => 'fallback',
            'value' => $fallback,
        ]);
    }

    /**
     * @return bool
     */
    public function isOverride(): bool
    {
        return $this->value instanceof BackupOverride && $this->type === 'override';
    }

    /**
     * @return BackupOverride
     */
    public function asOverride(): BackupOverride
    {
        if (!($this->value instanceof BackupOverride && $this->type === 'override')) {
            throw new Exception(
                "Expected override; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isFallback(): bool
    {
        return $this->value instanceof BackupOverride && $this->type === 'fallback';
    }

    /**
     * @return BackupOverride
     */
    public function asFallback(): BackupOverride
    {
        if (!($this->value instanceof BackupOverride && $this->type === 'fallback')) {
            throw new Exception(
                "Expected fallback; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'override':
                $value = $this->asOverride()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'fallback':
                $value = $this->asFallback()->jsonSerialize();
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
            case 'override':
                $args['value'] = BackupOverride::jsonDeserialize($data);
                break;
            case 'fallback':
                $args['value'] = BackupOverride::jsonDeserialize($data);
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
