from seed.types.operand import Operand
from src.seed.client import SeedEnum

def test_json() -> None:
    client = SeedEnum(base_url="https://yourhost.com/path/to/api")
    
    try:
        print("---- parameters ----")
        client.path_param.send(
            operand=Operand.EQUAL_TO,
            maybe_operand=Operand.EQUAL_TO,
            operand_or_color=Operand.EQUAL_TO,
            maybe_operand_or_color=None
        )
    except:
        pass

    try:
        print("---- request ----")
        client.inlined_request.send(
            operand=Operand.EQUAL_TO,
            maybe_operand=Operand.EQUAL_TO,
            operand_or_color=Operand.EQUAL_TO,
            maybe_operand_or_color=None
        )
    except:
        pass

    try:
        print("---- query ----")
        client.query_param.send(
            operand=Operand.EQUAL_TO,
            maybe_operand=Operand.EQUAL_TO,
            operand_or_color=Operand.EQUAL_TO,
            maybe_operand_or_color=None
        )
    except:
        pass