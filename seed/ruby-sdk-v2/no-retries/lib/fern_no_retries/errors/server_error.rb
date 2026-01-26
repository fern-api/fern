# frozen_string_literal: true

module FernNoRetries
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
