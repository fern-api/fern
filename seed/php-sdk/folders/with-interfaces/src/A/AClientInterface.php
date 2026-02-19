<?php

namespace Seed\A;

use Seed\A\B\BClientInterface;
use Seed\A\C\CClientInterface;

interface AClientInterface
{
    /**
     * @return BClientInterface
     */
    public function getB(): BClientInterface;

    /**
     * @return CClientInterface
     */
    public function getC(): CClientInterface;
}
