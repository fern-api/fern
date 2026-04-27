# frozen_string_literal: true

require "test_helper"

describe <%= gem_namespace %>::Internal::Http::RawClient do
  def make_response(status_code)
    response = Minitest::Mock.new
    response.expect(:code, status_code.to_s)
    response
  end

  describe "#should_retry?" do
    let(:client) do
      <%= gem_namespace %>::Internal::Http::RawClient.new(base_url: "https://example.com", max_retries: 3)
    end

    it "retries on 408 Request Timeout" do
      assert client.should_retry?(make_response(408), 0)
    end

    it "retries on 429 Too Many Requests" do
      assert client.should_retry?(make_response(429), 0)
    end

    it "retries on 501 through 599 (5xx except 500)" do
      [501, 502, 503, 504, 521, 522, 524, 599].each do |status|
        assert client.should_retry?(make_response(status), 0), "expected retry for status #{status}"
      end
    end

    it "does not retry on 500 Internal Server Error" do
      refute client.should_retry?(make_response(500), 0)
    end

    it "does not retry on 600 (above 5xx range)" do
      refute client.should_retry?(make_response(600), 0)
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
end
