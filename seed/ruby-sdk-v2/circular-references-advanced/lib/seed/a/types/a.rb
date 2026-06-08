# frozen_string_literal: true

module Seed
  module A
    module Types
      class A < Internal::Types::Model
        field :s, -> { String }, optional: false, nullable: false
      end
    end
  end
end
