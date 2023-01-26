import datetime as dt


def serialize_datetime(v: dt.datetime) -> str:
    if v.tzinfo is not None:
        return v.isoformat()
    else:
        local_tz = dt.datetime.now().astimezone().tzinfo
        return v.replace(tzinfo=local_tz).isoformat()
