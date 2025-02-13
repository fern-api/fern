<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class WorkspaceSubmissionUpdateInfo extends JsonSerializableType
{
    /**
     * @var string $type
     */
    public readonly string $type;

    /**
     * @var (
     *    value-of<RunningSubmissionState>
     *   |WorkspaceRunDetails
     *   |null
     *   |WorkspaceTracedUpdate
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: string,
     *   value: (
     *    value-of<RunningSubmissionState>
     *   |WorkspaceRunDetails
     *   |null
     *   |WorkspaceTracedUpdate
     *   |mixed
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
        $this->value = $values['value'];
    }

    /**
     * @param value-of<RunningSubmissionState> $running
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function running(string $running): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'running',
            'value' => $running,
        ]);
    }

    /**
     * @param WorkspaceRunDetails $ran
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function ran(WorkspaceRunDetails $ran): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'ran',
            'value' => $ran,
        ]);
    }

    /**
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function stopped(): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'stopped',
            'value' => null,
        ]);
    }

    /**
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function traced(): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'traced',
            'value' => null,
        ]);
    }

    /**
     * @param WorkspaceTracedUpdate $tracedV2
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function tracedV2(WorkspaceTracedUpdate $tracedV2): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'tracedV2',
            'value' => $tracedV2,
        ]);
    }

    /**
     * @param mixed $errored
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function errored(mixed $errored): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'errored',
            'value' => $errored,
        ]);
    }

    /**
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function finished(): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => 'finished',
            'value' => null,
        ]);
    }

    /**
     * @param mixed $_unknown
     * @return WorkspaceSubmissionUpdateInfo
     */
    public static function _unknown(mixed $_unknown): WorkspaceSubmissionUpdateInfo
    {
        return new WorkspaceSubmissionUpdateInfo([
            'type' => '_unknown',
            'value' => $_unknown,
        ]);
    }

    /**
     * @return bool
     */
    public function isRunning(): bool
    {
        return $this->value instanceof RunningSubmissionState && $this->type === 'running';
    }

    /**
     * @return value-of<RunningSubmissionState>
     */
    public function asRunning(): string
    {
        if (!($this->value instanceof RunningSubmissionState && $this->type === 'running')) {
            throw new Exception(
                "Expected running; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRan(): bool
    {
        return $this->value instanceof WorkspaceRunDetails && $this->type === 'ran';
    }

    /**
     * @return WorkspaceRunDetails
     */
    public function asRan(): WorkspaceRunDetails
    {
        if (!($this->value instanceof WorkspaceRunDetails && $this->type === 'ran')) {
            throw new Exception(
                "Expected ran; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isStopped(): bool
    {
        return is_null($this->value) && $this->type === 'stopped';
    }

    /**
     * @return bool
     */
    public function isTraced(): bool
    {
        return is_null($this->value) && $this->type === 'traced';
    }

    /**
     * @return bool
     */
    public function isTracedV2(): bool
    {
        return $this->value instanceof WorkspaceTracedUpdate && $this->type === 'tracedV2';
    }

    /**
     * @return WorkspaceTracedUpdate
     */
    public function asTracedV2(): WorkspaceTracedUpdate
    {
        if (!($this->value instanceof WorkspaceTracedUpdate && $this->type === 'tracedV2')) {
            throw new Exception(
                "Expected tracedV2; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isErrored(): bool
    {
        return is_null($this->value) && $this->type === 'errored';
    }

    /**
     * @return mixed
     */
    public function asErrored(): mixed
    {
        if (!(is_null($this->value) && $this->type === 'errored')) {
            throw new Exception(
                "Expected errored; got " . $this->type . "with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isFinished(): bool
    {
        return is_null($this->value) && $this->type === 'finished';
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
            case 'running':
                $value = $this->value;
                $result['running'] = $value;
                break;
            case 'ran':
                $value = $this->asRan()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'stopped':
                $result['stopped'] = [];
                break;
            case 'traced':
                $result['traced'] = [];
                break;
            case 'tracedV2':
                $value = $this->asTracedV2()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'errored':
                $value = $this->value;
                $result['errored'] = $value;
                break;
            case 'finished':
                $result['finished'] = [];
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

        switch ($type) {
            case 'running':
                $args['type'] = 'running';
                if (!array_key_exists('running', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'running'",
                    );
                }

                $args['running'] = $data['running'];
                break;
            case 'ran':
                $args['type'] = 'ran';
                $args['ran'] = WorkspaceRunDetails::jsonDeserialize($data);
                break;
            case 'stopped':
                $args['type'] = 'stopped';
                $args['value'] = null;
                break;
            case 'traced':
                $args['type'] = 'traced';
                $args['value'] = null;
                break;
            case 'tracedV2':
                $args['type'] = 'tracedV2';
                $args['tracedV2'] = WorkspaceTracedUpdate::jsonDeserialize($data);
                break;
            case 'errored':
                $args['type'] = 'errored';
                if (!array_key_exists('errored', $data)) {
                    throw new Exception(
                        "JSON data is missing property 'errored'",
                    );
                }

                $args['errored'] = $data['errored'];
                break;
            case 'finished':
                $args['type'] = 'finished';
                $args['value'] = null;
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
