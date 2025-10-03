import re
import unicodedata
from typing import List, Optional, Union
from dataclasses import dataclass


@dataclass
class SafeAndUnsafeString:
    unsafe_name: str
    safe_name: str


@dataclass
class CasedName:
    original_name: str
    camel_case: Optional[SafeAndUnsafeString] = None
    pascal_case: Optional[SafeAndUnsafeString] = None
    snake_case: Optional[SafeAndUnsafeString] = None
    screaming_snake_case: Optional[SafeAndUnsafeString] = None


@dataclass
class ExpandedName:
    original_name: str
    camel_case: SafeAndUnsafeString
    pascal_case: SafeAndUnsafeString
    snake_case: SafeAndUnsafeString
    screaming_snake_case: SafeAndUnsafeString


@dataclass
class NameAndWireValue:
    wire_value: str
    name: Union[str, CasedName]


@dataclass
class ExpandedNameAndWireValue:
    wire_value: str
    name: ExpandedName


Name = Union[str, CasedName]


# Lodash-inspired utility functions
# Based on lodash.js implementation

# ASCII word regex - matches sequences of ASCII alphanumeric characters
RE_ASCII_WORD = re.compile(r'[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+')

# Unicode word regex - comprehensive pattern for matching words in various scripts
# This is a simplified version of lodash's complex Unicode regex
RE_UNICODE_WORD = re.compile(r'[A-Za-zÀ-ÿ0-9]+|[^\x00-\x7F]+')

# Regex for matching apostrophes
RE_APOS = re.compile(r"['']")


def deburr(text: str) -> str:
    """Remove diacritics from text, similar to lodash's deburr function."""
    # Normalize to NFD (decomposed form) then remove combining characters
    nfd_form = unicodedata.normalize('NFD', text)
    return ''.join(char for char in nfd_form if unicodedata.category(char) != 'Mn')


def has_unicode_word(text: str) -> bool:
    """Check if text contains unicode characters beyond ASCII."""
    return any(ord(char) > 127 for char in text)


def words(text: str) -> List[str]:
    """Split text into words, similar to lodash's words function."""
    # Remove apostrophes first
    text = RE_APOS.sub('', text)
    
    # Use Unicode or ASCII word matching based on content
    if has_unicode_word(text):
        return RE_UNICODE_WORD.findall(text)
    else:
        return RE_ASCII_WORD.findall(text)


def capitalize(word: str) -> str:
    """Capitalize the first character and lowercase the rest."""
    if not word:
        return ""
    return word[0].upper() + word[1:].lower()


def camel_case(text: str) -> str:
    """Convert string to camelCase using lodash algorithm."""
    word_list = words(deburr(text))
    if not word_list:
        return ""
    
    result = word_list[0].lower()
    for word in word_list[1:]:
        result += capitalize(word)
    
    return result


def snake_case(text: str) -> str:
    """Convert string to snake_case using lodash algorithm."""
    word_list = words(deburr(text))
    return '_'.join(word.lower() for word in word_list)


def upper_first(text: str) -> str:
    """Capitalize the first character of a string."""
    if not text:
        return ""
    return text[0].upper() + text[1:]


def expand_name_and_wire_value(name_and_wire_value: NameAndWireValue) -> ExpandedNameAndWireValue:
    """Expand a NameAndWireValue into an ExpandedNameAndWireValue."""
    return ExpandedNameAndWireValue(
        wire_value=name_and_wire_value.wire_value,
        name=expand_name(name_and_wire_value.name)
    )


def expand_name(name: Name) -> ExpandedName:
    """Expand a Name into an ExpandedName with all case variations."""
    original_name = get_original_name(name)
    camel_case_name = camel_case(original_name)
    pascal_case_name = upper_first(camel_case_name)
    snake_case_name = snake_case(original_name)
    screaming_snake_case_name = snake_case_name.upper()
    
    if isinstance(name, CasedName):
        return ExpandedName(
            original_name=original_name,
            camel_case=name.camel_case or SafeAndUnsafeString(
                unsafe_name=camel_case_name,
                safe_name=camel_case_name
            ),
            pascal_case=name.pascal_case or SafeAndUnsafeString(
                unsafe_name=pascal_case_name,
                safe_name=pascal_case_name
            ),
            snake_case=name.snake_case or SafeAndUnsafeString(
                unsafe_name=snake_case_name,
                safe_name=snake_case_name
            ),
            screaming_snake_case=name.screaming_snake_case or SafeAndUnsafeString(
                unsafe_name=screaming_snake_case_name,
                safe_name=screaming_snake_case_name
            )
        )
    
    return ExpandedName(
        original_name=original_name,
        camel_case=SafeAndUnsafeString(
            unsafe_name=camel_case_name,
            safe_name=camel_case_name
        ),
        pascal_case=SafeAndUnsafeString(
            unsafe_name=pascal_case_name,
            safe_name=pascal_case_name
        ),
        snake_case=SafeAndUnsafeString(
            unsafe_name=snake_case_name,
            safe_name=snake_case_name
        ),
        screaming_snake_case=SafeAndUnsafeString(
            unsafe_name=screaming_snake_case_name,
            safe_name=screaming_snake_case_name
        )
    )


def get_original_name(name: Name) -> str:
    """Get the original name from a Name object."""
    if isinstance(name, str):
        return name
    return name.original_name