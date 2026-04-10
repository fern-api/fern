<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Exception;
use Seed\Core\Json\JsonDecoder;

class TestSubmissionStatus extends JsonSerializableType
{
    /**
     * @var (
     *    'stopped'
     *   |'errored'
     *   |'running'
     *   |'testCaseIdToState'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    TestSubmissionStatusStopped
     *   |TestSubmissionStatusErrored
     *   |TestSubmissionStatusRunning
     *   |TestSubmissionStatusTestCaseIdToState
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   type: (
     *    'stopped'
     *   |'errored'
     *   |'running'
     *   |'testCaseIdToState'
     *   |'_unknown'
     * ),
     *   value: (
     *    TestSubmissionStatusStopped
     *   |TestSubmissionStatusErrored
     *   |TestSubmissionStatusRunning
     *   |TestSubmissionStatusTestCaseIdToState
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
     * @param TestSubmissionStatusStopped $stopped
     * @return TestSubmissionStatus
     */
    public static function stopped(TestSubmissionStatusStopped $stopped): TestSubmissionStatus
    {
        return new TestSubmissionStatus([
            'type' => 'stopped',
            'value' => $stopped,
        ]);
    }

    /**
     * @param TestSubmissionStatusErrored $errored
     * @return TestSubmissionStatus
     */
    public static function errored(TestSubmissionStatusErrored $errored): TestSubmissionStatus
    {
        return new TestSubmissionStatus([
            'type' => 'errored',
            'value' => $errored,
        ]);
    }

    /**
     * @param TestSubmissionStatusRunning $running
     * @return TestSubmissionStatus
     */
    public static function running(TestSubmissionStatusRunning $running): TestSubmissionStatus
    {
        return new TestSubmissionStatus([
            'type' => 'running',
            'value' => $running,
        ]);
    }

    /**
     * @param TestSubmissionStatusTestCaseIdToState $testCaseIdToState
     * @return TestSubmissionStatus
     */
    public static function testCaseIdToState(TestSubmissionStatusTestCaseIdToState $testCaseIdToState): TestSubmissionStatus
    {
        return new TestSubmissionStatus([
            'type' => 'testCaseIdToState',
            'value' => $testCaseIdToState,
        ]);
    }

    /**
     * @return bool
     */
    public function isStopped(): bool
    {
        return $this->value instanceof TestSubmissionStatusStopped && $this->type === 'stopped';
    }

    /**
     * @return TestSubmissionStatusStopped
     */
    public function asStopped(): TestSubmissionStatusStopped
    {
        if (!($this->value instanceof TestSubmissionStatusStopped && $this->type === 'stopped')) {
            throw new Exception(
                "Expected stopped; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isErrored(): bool
    {
        return $this->value instanceof TestSubmissionStatusErrored && $this->type === 'errored';
    }

    /**
     * @return TestSubmissionStatusErrored
     */
    public function asErrored(): TestSubmissionStatusErrored
    {
        if (!($this->value instanceof TestSubmissionStatusErrored && $this->type === 'errored')) {
            throw new Exception(
                "Expected errored; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isRunning(): bool
    {
        return $this->value instanceof TestSubmissionStatusRunning && $this->type === 'running';
    }

    /**
     * @return TestSubmissionStatusRunning
     */
    public function asRunning(): TestSubmissionStatusRunning
    {
        if (!($this->value instanceof TestSubmissionStatusRunning && $this->type === 'running')) {
            throw new Exception(
                "Expected running; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }

        return $this->value;
    }

    /**
     * @return bool
     */
    public function isTestCaseIdToState(): bool
    {
        return $this->value instanceof TestSubmissionStatusTestCaseIdToState && $this->type === 'testCaseIdToState';
    }

    /**
     * @return TestSubmissionStatusTestCaseIdToState
     */
    public function asTestCaseIdToState(): TestSubmissionStatusTestCaseIdToState
    {
        if (!($this->value instanceof TestSubmissionStatusTestCaseIdToState && $this->type === 'testCaseIdToState')) {
            throw new Exception(
                "Expected testCaseIdToState; got " . $this->type . " with value of type " . get_debug_type($this->value),
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
            case 'stopped':
                $value = $this->asStopped()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'errored':
                $value = $this->asErrored()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'running':
                $value = $this->asRunning()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'testCaseIdToState':
                $value = $this->asTestCaseIdToState()->jsonSerialize();
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
            case 'stopped':
                $args['value'] = TestSubmissionStatusStopped::jsonDeserialize($data);
                break;
            case 'errored':
                $args['value'] = TestSubmissionStatusErrored::jsonDeserialize($data);
                break;
            case 'running':
                $args['value'] = TestSubmissionStatusRunning::jsonDeserialize($data);
                break;
            case 'testCaseIdToState':
                $args['value'] = TestSubmissionStatusTestCaseIdToState::jsonDeserialize($data);
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
