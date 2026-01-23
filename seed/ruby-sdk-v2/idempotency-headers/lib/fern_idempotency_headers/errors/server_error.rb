# frozen_string_literal: true

module FernIdempotencyHeaders
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
