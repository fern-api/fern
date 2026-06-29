import re

# https://github.com/Tcdian/Lodash/blob/master/source/string/words.ts
word_pattern = re.compile("|".join(["[A-Z][a-z]+", "[A-Z]+(?=[A-Z][a-z])", "[A-Z]+", "[a-z]+", "[0-9]+"]))

_LEADING_UNDERSCORES = re.compile(r"^(_+)")
_TRAILING_UNDERSCORES = re.compile(r"(_+)$")


def snake_case(s: str) -> str:
    leading_match = _LEADING_UNDERSCORES.match(s)
    trailing_match = _TRAILING_UNDERSCORES.search(s)
    leading = leading_match.group(1) if leading_match else ""
    trailing = trailing_match.group(1) if trailing_match else ""
    if leading and len(leading) + len(trailing) >= len(s):
        return s
    core = s[len(leading) : len(s) - len(trailing) if trailing else len(s)]
    result = "_".join(word.lower() for word in word_pattern.findall(core))
    return f"{leading}{result}{trailing}"
