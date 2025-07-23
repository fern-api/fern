# frozen_string_literal: true

module Package
    module Types
        class Record < Internal::Types::Model
            field :foo, Array, optional: true, nullable: true
            field :_3_d, Integer, optional: true, nullable: true
        end
    end
end
