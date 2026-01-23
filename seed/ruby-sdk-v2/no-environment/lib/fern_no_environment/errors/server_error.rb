# frozen_string_literal: true

module FernNoEnvironment
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
