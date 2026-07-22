<?php

namespace Seed;

/**
 * Represents the available environments for the API with multiple base URLs.
 */
class Environments
{
    /**
     * @var string $acme
     */
    public readonly string $acme;

    /**
     * @var string $oauth
     */
    public readonly string $oauth;

    /**
     * @param string $acme The acme base URL
     * @param string $oauth The oauth base URL
     */
    private function __construct(
        string $acme,
        string $oauth,
    ) {
        $this->acme = $acme;
        $this->oauth = $oauth;
    }

    /**
     * Production environment
     *
     * @return Environments
     */
    public static function Production(): Environments
    {
        return new self(
            acme: 'https://api.acme.com',
            oauth: 'https://oauth.acme.com'
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
            acme: 'https://api.stage.acme.com',
            oauth: 'https://oauth.stage.acme.com'
        );
    }

    /**
     * Development environment
     *
     * @return Environments
     */
    public static function Development(): Environments
    {
        return new self(
            acme: 'https://api.dev.acme.com',
            oauth: 'https://oauth.dev.acme.com'
        );
    }

    /**
     * Create a custom environment with your own URLs
     *
     * @param string $acme The acme base URL
     * @param string $oauth The oauth base URL
     * @return Environments
     */
    public static function custom(string $acme, string $oauth): Environments
    {
        return new self(
            acme: $acme,
            oauth: $oauth
        );
    }
}
