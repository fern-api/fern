# frozen_string_literal: true

module Commons
    module Types
        class TestCase < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :params, Array, optional: true, nullable: true
        end
    end
end
