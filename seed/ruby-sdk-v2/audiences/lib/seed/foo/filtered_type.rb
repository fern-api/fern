# frozen_string_literal: true

module Seed
    module Types
        class FilteredType < Internal::Types::Model
            field :public_property, String, optional: true, nullable: false
            field :private_property, Integer, optional: false, nullable: false

    end
end
