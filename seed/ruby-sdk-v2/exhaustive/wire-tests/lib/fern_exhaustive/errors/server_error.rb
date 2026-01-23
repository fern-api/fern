# frozen_string_literal: true

module FernExhaustive
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
