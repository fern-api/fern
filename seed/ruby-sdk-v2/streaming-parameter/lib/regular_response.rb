# frozen_string_literal: true

module Dummy
    module Types
        class RegularResponse < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :name, Array, optional: true, nullable: true
        end
    end
end
