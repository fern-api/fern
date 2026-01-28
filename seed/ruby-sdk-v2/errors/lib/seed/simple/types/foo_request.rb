# frozen_string_literal: true

module Seed
  module Simple
    module Types
      class FooRequest < Internal::Types::Model
        field :bar, -> { String }, optional: false, nullable: false
      end
    end
  end
end
