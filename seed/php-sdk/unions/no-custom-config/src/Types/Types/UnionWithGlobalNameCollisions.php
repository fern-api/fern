<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;

class UnionWithGlobalNameCollisions extends JsonSerializableType
{
    /**
     * @var (
     *    'Date'
     *   |'Error'
     *   |'Aim'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    string
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'Date'
     *   |'Error'
     *   |'Aim'
     *   |'_unknown'
     * ),
     *   value: (
     *    string
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
     * @param string $date
     * @return UnionWithGlobalNameCollisions
     */
    public static function date(string $date): UnionWithGlobalNameCollisions
    {
        return new UnionWithGlobalNameCollisions([
            'type' => 'Date',
            'value' => $date,
        ]);
    }

    /**
     * @param string $error
     * @return UnionWithGlobalNameCollisions
     */
    public static function error(string $error): UnionWithGlobalNameCollisions
    {
        return new UnionWithGlobalNameCollisions([
            'type' => 'Error',
            'value' => $error,
        ]);
    }

    /**
     * @param string $aim
     * @return UnionWithGlobalNameCollisions
     */
    public static function aim(string $aim): UnionWithGlobalNameCollisions
    {
        return new UnionWithGlobalNameCollisions([
            'type' => 'Aim',
            'value' => $aim,
        ]);
    }

    /**
     * @return bool
     */
    public function isDate(): bool
    {
        return is_string($this->value) && $this->type === 'Date';
    }

    /**
     * @return string
     */
    public function asDate(): string
    {
        if (!(is_string($this->value) && $this->type === 'Date')) {
            throw new Exception(
                "Expected Date; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isError(): bool
    {
        return is_string($this->value) && $this->type === 'Error';
    }

    /**
     * @return string
     */
    public function asError(): string
    {
        if (!(is_string($this->value) && $this->type === 'Error')) {
            throw new Exception(
                "Expected Error; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isAim(): bool
    {
        return is_string($this->value) && $this->type === 'Aim';
    }

    /**
     * @return string
     */
    public function asAim(): string
    {
        if (!(is_string($this->value) && $this->type === 'Aim')) {
            throw new Exception(
                "Expected Aim; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'Date':
                $value = $this->value;
                $result['Date'] = $value;
                break;
            case 'Error':
                $value = $this->value;
                $result['Error'] = $value;
                break;
            case 'Aim':
                $value = $this->value;
                $result['Aim'] = $value;
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
            case 'Date':
                if (!array_key_exists('Date', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'Date'",
                    );
                }

                $args['value'] = $data['Date'];
                break;
            case 'Error':
                if (!array_key_exists('Error', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'Error'",
                    );
                }

                $args['value'] = $data['Error'];
                break;
            case 'Aim':
                if (!array_key_exists('Aim', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'Aim'",
                    );
                }

                $args['value'] = $data['Aim'];
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
