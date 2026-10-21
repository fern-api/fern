# frozen_string_literal: true

require_relative "../.."

module Seed
  module Types
    module Types
      class FooExtended < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false

        field :age, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
