from pydantic import BaseModel
from resources.v_2.resources.v_3.resources.problem.types.non_void_function_definition import NonVoidFunctionDefinition
from resources.v_2.resources.v_3.resources.problem.types.assert_correctness_check import AssertCorrectnessCheck
from dt import datetime
from core.datetime_utils import serialize_datetime
class TestCaseWithActualResultImplementation(BaseModel):
    get_actual_result: NonVoidFunctionDefinition = 
    assert_correctness_check: AssertCorrectnessCheck = 
    class Config:
        frozen = True
        smart_union = True
        json_encoders = {datetime: serialize_datetime}

