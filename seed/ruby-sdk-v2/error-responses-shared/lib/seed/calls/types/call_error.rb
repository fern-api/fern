# frozen_string_literal: true

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
