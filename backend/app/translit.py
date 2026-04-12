"""
Cyrillic → Latin transliteration for URL slugs and filenames (stdlib only).
Multi-letter mappings are applied first, then single-letter table + drop ъ/ь.
"""

# Multi-character sequences first (must run before single-char map)
_MULTI = (
    ("ё", "yo"),
    ("Ё", "Yo"),
    ("ж", "zh"),
    ("Ж", "Zh"),
    ("ц", "ts"),
    ("Ц", "Ts"),
    ("ч", "ch"),
    ("Ч", "Ch"),
    ("ш", "sh"),
    ("Ш", "Sh"),
    ("щ", "sch"),
    ("Щ", "Sch"),
    ("ю", "yu"),
    ("Ю", "Yu"),
    ("я", "ya"),
    ("Я", "Ya"),
)

_CYR_SINGLE = "абвгдезийклмнопрстуфхыэ"
_LAT_SINGLE = "abvgdezijklmnoprstufhye"
_SINGLE_TABLE = str.maketrans(
    _CYR_SINGLE + _CYR_SINGLE.upper(),
    _LAT_SINGLE + _LAT_SINGLE.upper(),
    "ъьЪЬ",
)


def transliterate(text: str) -> str:
    result = text
    for old, new in _MULTI:
        result = result.replace(old, new)
    return result.translate(_SINGLE_TABLE)
