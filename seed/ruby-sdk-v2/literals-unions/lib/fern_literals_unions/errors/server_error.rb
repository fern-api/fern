# frozen_string_literal: true

module FernLiteralsUnions
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
