import { describe, expect, it } from "vitest";

import { getMethodLineRange } from "../reference/getMethodLineRange.js";

const SOURCE = `import typing


class ActionsClient:
    def __init__(self, *, client_wrapper: SyncClientWrapper):
        self._raw_client = RawActionsClient(client_wrapper=client_wrapper)

    @property
    def with_raw_response(self) -> RawActionsClient:
        return self._raw_client

    def list(
        self, *, request_options: typing.Optional[RequestOptions] = None
    ) -> typing.List[str]:
        """
        Returns
        -------
        typing.List[str]
        """
        _response = self._raw_client.list(request_options=request_options)
        return _response.data

    @typing.overload
    def generate(self, *, stream: typing.Literal[True]) -> typing.Iterator[str]: ...

    @typing.overload
    def generate(self, *, stream: typing.Literal[False]) -> str: ...

    def generate(self, *, stream: bool) -> typing.Any:
        return self._raw_client.generate(stream=stream)


class AsyncActionsClient:
    async def list(self) -> typing.List[str]:
        return []

    async def delete(self) -> None:
        return None
`;

describe("getMethodLineRange", () => {
    it("spans a method from its def line to its last line, ignoring the closing signature line", () => {
        expect(getMethodLineRange({ source: SOURCE, methodName: "list" })).toEqual({ start: 12, end: 21 });
    });

    it("includes decorators and every overload", () => {
        expect(getMethodLineRange({ source: SOURCE, methodName: "generate" })).toEqual({ start: 23, end: 30 });
    });

    it("only searches the sync client", () => {
        expect(getMethodLineRange({ source: SOURCE, methodName: "delete" })).toBeUndefined();
    });

    it("returns undefined when there is no class", () => {
        expect(getMethodLineRange({ source: "import typing\n", methodName: "list" })).toBeUndefined();
    });
});
