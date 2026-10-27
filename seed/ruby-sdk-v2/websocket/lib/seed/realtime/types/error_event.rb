# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Realtime
    module Types
      class ErrorEvent < Internal::Types::Model
        field :error_code, -> { Integer }, optional: false, nullable: false, api_name: "errorCode"

        field :error_message, -> { String }, optional: false, nullable: false, api_name: "errorMessage"
      end
    end
  end
end
