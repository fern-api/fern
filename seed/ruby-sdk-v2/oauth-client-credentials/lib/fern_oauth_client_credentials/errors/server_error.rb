# frozen_string_literal: true

module FernOauthClientCredentials
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
