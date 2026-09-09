# frozen_string_literal: true

require "test_helper"
require "socket"
require "zlib"

describe Seed::Internal::Http::RawClient do
  def make_response(status_code)
    response = Minitest::Mock.new
    response.expect(:code, status_code.to_s)
    response
  end

  describe "#should_retry?" do
    let(:client) do
      Seed::Internal::Http::RawClient.new(base_url: "https://example.com", max_retries: 3)
    end

    it "retries on 408 Request Timeout" do
      assert client.should_retry?(make_response(408), 0)
    end

    it "retries on 429 Too Many Requests" do
      assert client.should_retry?(make_response(429), 0)
    end

    it "retries on retryable 5xx statuses" do
      [500, 502, 503, 504, 521, 522, 524].each do |status|
        assert client.should_retry?(make_response(status), 0), "expected retry for status #{status}"
      end
    end

    it "does not retry on non-retryable 5xx statuses" do
      [501, 505, 510, 599].each do |status|
        refute client.should_retry?(make_response(status), 0), "expected no retry for status #{status}"
      end
    end

    it "does not retry on 2xx success codes" do
      [200, 201, 204].each do |status|
        refute client.should_retry?(make_response(status), 0), "expected no retry for status #{status}"
      end
    end

    it "does not retry on 4xx other than 408 and 429" do
      [400, 401, 403, 404, 422].each do |status|
        refute client.should_retry?(make_response(status), 0), "expected no retry for status #{status}"
      end
    end

    it "does not retry when max retries is reached" do
      refute client.should_retry?(make_response(502), 3)
    end

    it "retries when attempt is below max retries" do
      assert client.should_retry?(make_response(502), 2)
    end
  end

  describe "gzip response decompression" do
    it "decompresses a gzip response when Accept-Encoding is set explicitly" do
      body = '{"message": "gzipped response"}'
      compressed = Zlib.gzip(body)

      server = TCPServer.new("127.0.0.1", 0)
      port = server.addr[1]
      server_thread = Thread.new do
        socket = server.accept
        request_lines = []
        while (line = socket.gets) && line != "\r\n"
          request_lines << line
        end
        socket.write("HTTP/1.1 200 OK\r\n")
        socket.write("Content-Type: application/json\r\n")
        socket.write("Content-Encoding: gzip\r\n")
        socket.write("Content-Length: #{compressed.bytesize}\r\n")
        socket.write("\r\n")
        socket.write(compressed)
        socket.close
        request_lines
      end

      client = Seed::Internal::Http::RawClient.new(
        base_url: "http://127.0.0.1:#{port}",
        max_retries: 0
      )
      request = Seed::Internal::JSON::Request.new(
        base_url: "http://127.0.0.1:#{port}",
        path: "/gzip",
        method: "GET",
        headers: { "Accept-Encoding" => "gzip" }
      )

      response = client.send(request)
      request_lines = server_thread.value
      server.close

      assert(request_lines.any? { |line| line.casecmp("accept-encoding: gzip\r\n").zero? })
      assert_equal "200", response.code
      assert_equal body, response.body
    end
  end

  # A minimal auth provider whose `auth_headers` returns a *different* token on
  # each call, simulating a token that is refreshed on expiry.
  class RefreshingAuthProvider
    def initialize
      @count = 0
    end

    def auth_headers
      @count += 1
      { "Authorization" => "Bearer TOKEN_#{@count}" }
    end
  end

  describe "#resolve_auth_headers" do
    it "returns an empty hash when no auth provider is configured" do
      client = Seed::Internal::Http::RawClient.new(base_url: "https://example.com")

      assert_equal({}, client.resolve_auth_headers)
    end

    it "consults the auth provider on every call so an expired token is refreshed" do
      client = Seed::Internal::Http::RawClient.new(
        base_url: "https://example.com",
        auth_provider: RefreshingAuthProvider.new
      )

      assert_equal({ "Authorization" => "Bearer TOKEN_1" }, client.resolve_auth_headers)
      assert_equal({ "Authorization" => "Bearer TOKEN_2" }, client.resolve_auth_headers)
    end
  end

  describe "#build_http_request auth header precedence" do
    let(:client) do
      Seed::Internal::Http::RawClient.new(
        base_url: "https://example.com",
        headers: { "Authorization" => "Bearer STATIC" }
      )
    end

    it "lets resolved auth headers override the static default headers" do
      request = client.build_http_request(
        url: URI.parse("https://example.com"),
        method: "GET",
        auth_headers: { "Authorization" => "Bearer FRESH" }
      )

      assert_equal("Bearer FRESH", request["Authorization"])
    end

    it "lets per-request headers take precedence over auth headers" do
      request = client.build_http_request(
        url: URI.parse("https://example.com"),
        method: "GET",
        headers: { "Authorization" => "Bearer PER_REQUEST" },
        auth_headers: { "Authorization" => "Bearer FRESH" }
      )

      assert_equal("Bearer PER_REQUEST", request["Authorization"])
    end

    it "defaults auth headers to empty, leaving the default headers unchanged" do
      request = client.build_http_request(url: URI.parse("https://example.com"), method: "GET")

      assert_equal("Bearer STATIC", request["Authorization"])
    end
  end

  describe "#protected_header_keys" do
    def client_with(overridable_headers)
      Seed::Internal::Http::RawClient.new(
        base_url: "https://example.com",
        headers: { "X-Api-Version" => "1", "User-Agent" => "sdk/0.0.1" },
        overridable_headers: overridable_headers
      )
    end

    it "protects every default header when no header is overridable" do
      assert_includes client_with([]).protected_header_keys, "X-Api-Version"
    end

    it "leaves an overridable header unprotected so a request can replace it" do
      protected_keys = client_with(["X-Api-Version"]).protected_header_keys

      refute_includes protected_keys, "X-Api-Version"
      assert_includes protected_keys, "User-Agent"
    end

    it "matches overridable header names case-insensitively" do
      refute_includes client_with(["x-api-version"]).protected_header_keys, "X-Api-Version"
    end
  end
end
