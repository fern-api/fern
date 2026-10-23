# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Calls
    module Types
      class CallError < Internal::Types::Model
        field :code, -> { Integer }, optional: true, nullable: false

        field :message, -> { String }, optional: true, nullable: false
      end
    end
  end
end
