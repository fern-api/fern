import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { responseMetadataCallback } from "./responseMetadataCallback.js";

describe("successful response metadata callback", () => {
    it("preserves return values and reports every successful response without shared client state", () => {
        const script = `require "json"
require "net/http"
def invoke(code, body, request_options = {})
  response = Net::HTTPResponse.new("1.1", code.to_s, "fixture")
  response["X-Request-Id"] = "request-id"
  response.add_field("Set-Cookie", "a=1")
  response.add_field("Set-Cookie", "b=2")
  ${responseMetadataCallback()}
  body
end
seen = []
options = { on_response: ->(status:, headers:) { seen << [status, headers] } }
raise unless invoke(200, { "value" => 1 }, options) == { "value" => 1 }
raise unless invoke(204, nil, options).nil?
bytes = "\\x00\\xff".b
raise unless invoke(200, bytes, options).equal?(bytes)
raise unless invoke(200, [1, 2], options) == [1, 2]
raise unless invoke(200, "plain") == "plain"
invoke(400, "error", options)
raise unless seen.length == 4
raise unless seen.map(&:first) == [200, 204, 200, 200]
raise unless seen.first.last["x-request-id"] == ["request-id"]
raise unless seen.first.last["set-cookie"] == ["a=1", "b=2"]
other = []
invoke(201, "created", on_response: ->(status:, headers:) { other << status })
raise unless other == [201] && seen.length == 4
begin
  invoke(200, "value", on_response: ->(**) { raise "callback failure" })
  raise "exception swallowed"
rescue RuntimeError => error
  raise unless error.message == "callback failure"
end
puts "ok"
`;
        expect(execFileSync(process.env.RUBY ?? "ruby", ["-e", script], { encoding: "utf8" }).trim()).toBe("ok");
    });
});
