# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        class DoubleOptional < Internal::Types::Model
          field :optional_alias, -> { String }, optional: true, nullable: false

        end
      end
    end
  end
end
