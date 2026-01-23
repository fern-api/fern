# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Errors
    class ServerError < ResponseError
    end

    class ServiceUnavailableError < ApiError
    end
  end
end
