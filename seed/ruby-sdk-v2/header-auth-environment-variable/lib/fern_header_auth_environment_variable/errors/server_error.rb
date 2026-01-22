# frozen_string_literal: true

module FernHeaderAuthEnvironmentVariable
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
