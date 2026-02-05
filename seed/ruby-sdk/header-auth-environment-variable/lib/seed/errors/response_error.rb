# frozen_string_literal: true

module Seed
  module Errors
    class ResponseError < ApiError
      attr_reader :code

      def initialize(msg, code:)
        @code = code
        super(msg)
      end

      def inspect
        "#<#{self.class.name} @code=#{code} @body=#{message}>"
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
