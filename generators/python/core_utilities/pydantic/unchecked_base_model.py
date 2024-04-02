from datetime_utils import serialize_datetime
import datetime as dt

try:
    import pydantic.v1 as pydantic  # type: ignore
except ImportError:
    import pydantic  # type: ignore


class UncheckedBaseModel(pydantic.BaseModel):
    # Allow extra fields
    class Config:
        extra = pydantic.Extra.allow
        smart_union = True
        allow_population_by_field_name = True
        populate_by_name = True
        extra = pydantic.Extra.allow
        json_encoders = {dt.datetime: serialize_datetime}


    # Allow construct to not validate model
    # Implementation taken from: https://github.com/pydantic/pydantic/issues/1168#issuecomment-817742836
    @classmethod
    def construct(cls, _fields_set=set(), **values):
        m = cls.__new__(cls)
        fields_values = {}

        config = cls.__config__

        if _fields_set is None:
            _fields_set = set(values.keys())

        for name, field in cls.__fields__.items():
            key = field.alias
            if key not in values and config.allow_population_by_field_name: # Added this to allow population by field name
                key = name

            if key in values: 
                if values[key] is None and not field.required: # Moved this check since None value can be passed for Optional nested field
                    fields_values[name] = field.get_default()
                else:
                    if issubclass(field.type_, pydantic.BaseModel):
                        if field.shape == 2:
                            fields_values[name] = [
                                field.type_.construct(**e)
                                for e in values[key]
                            ]
                        else:
                            fields_values[name] = field.outer_type_.construct(**values[key])
                    else:
                        fields_values[name] = values[key]
            elif not field.required:
                fields_values[name] = field.get_default()

        # Add extras back in
        for key, value in values.items():
            if key not in cls.__fields__:
                _fields_set.add(key)
                fields_values[key] = value

        object.__setattr__(m, '__dict__', fields_values)
        object.__setattr__(m, '__fields_set__', _fields_set)
        m._init_private_attributes()
        return m
