# frozen_string_literal: true

module Seed
  module Types
    class FooRequest < Internal::Types::Model
      field :bar, -> { String }, optional: false, nullable: false
    end
  end
end
