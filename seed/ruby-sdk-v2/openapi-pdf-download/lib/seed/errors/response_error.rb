# frozen_string_literal: true

module Seed
  module Errors
    class ResponseError < ApiError
      attr_reader :code, :body

      # @param msg [String] The raw response body.
      # @param code [Integer] The HTTP status code.
      # @param body [Object, nil] The response body parsed into the endpoint's declared error type, if any.
      def initialize(msg, code:, body: nil)
        @code = code
        @body = body
        super(msg)
      end

      def inspect
        "#<#{self.class.name} @code=#{code} @body=#{message}>"
      end

      # Parses a raw error response body into the type declared for its status code.
      #
      # @param code [Integer]
      # @param raw_body [String, nil]
      # @param types [Hash{Integer, Range => Class}] Matchers in priority order.
      # @return [Object, nil] nil when no type matches or the body cannot be parsed.
      def self.load_error_body(code, raw_body, types)
        type = types.find { |matcher, _| matcher.is_a?(::Range) ? matcher.cover?(code) : matcher == code }&.last
        return nil if type.nil? || raw_body.to_s.empty?

        begin
          type.load(raw_body)
        rescue StandardError
          nil
        end
      end

      # Returns the most appropriate error class for the given code.
      #
      # @return [Class]
      def self.subclass_for_code(code)
        case code
        when 300..399
          RedirectError
        when 401
          UnauthorizedError
        when 403
          ForbiddenError
        when 404
          NotFoundError
        when 400..499
          ClientError
        when 503
          ServiceUnavailableError
        when 500..599
          ServerError
        else
          ResponseError
        end
      end
    end
  end
end
