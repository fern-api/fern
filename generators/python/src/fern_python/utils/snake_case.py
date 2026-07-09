import re

# https://github.com/Tcdian/Lodash/blob/master/source/string/words.ts
word_pattern = re.compile("|".join(["[A-Z][a-z]+", "[A-Z]+(?=[A-Z][a-z])", "[A-Z]+", "[a-z]+", "[0-9]+"]))


def snake_case(s: str) -> str:
    return "_".join(word.lower() for word in word_pattern.findall(s))
