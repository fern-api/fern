# frozen_string_literal: true

module Seed
  module Service
    module Types
      class MyObject < Internal::Types::Model
        field :foo, -> { String }, optional: false, nullable: false
      end
    end
  end
end
