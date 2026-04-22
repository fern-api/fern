<?php

namespace Seed\Types;

enum EnumWithSpecialCharacters: string
{
    case Bla = "\\\$bla";
    case Yo = "\\\$yo";
}
