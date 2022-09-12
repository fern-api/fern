from enum import Enum


class PrimitiveType(str, Enum):
    integer = "INTEGER"
    double = "DOUBLE"
    string = "STRING"
    boolean = "BOOLEAN"
    long = "LONG"
    date_time = "DATE_TIME"
    uuid = "UUID"
