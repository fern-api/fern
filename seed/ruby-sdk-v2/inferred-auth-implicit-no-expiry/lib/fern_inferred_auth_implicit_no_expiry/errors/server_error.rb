# frozen_string_literal: true

module FernInferredAuthImplicitNoExpiry
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
