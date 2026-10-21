# frozen_string_literal: true

require_relative "../.."

module Seed
  module Commons
    module Types
      class ErrorBody < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false

        field :code, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
