<?php

namespace Seed;

/**
 * Represents the available environments for the API with multiple base URLs.
 */
class Environments
{
    /**
     * @var string $rest
     */
    public readonly string $rest;

    /**
     * @var string $wss
     */
    public readonly string $wss;

    /**
     * @param string $rest The rest base URL
     * @param string $wss The wss base URL
     */
    private function __construct(
        string $rest,
        string $wss,
    ) {
        $this->rest = $rest;
        $this->wss = $wss;
    }

    /**
     * Production environment
     *
     * @return Environments
     */
    public static function Production(): Environments
    {
        return new self(
            rest: 'https://api.production.com',
            wss: 'wss://ws.production.com'
        );
    }

    /**
     * Staging environment
     *
     * @return Environments
     */
    public static function Staging(): Environments
    {
        return new self(
            rest: 'https://api.staging.com',
            wss: 'wss://ws.staging.com'
        );
    }

    /**
     * Create a custom environment with your own URLs
     *
     * @param string $rest The rest base URL
     * @param string $wss The wss base URL
     * @return Environments
     */
    public static function custom(string $rest, string $wss): Environments
    {
        return new self(
            rest: $rest,
            wss: $wss
        );
    }
}
