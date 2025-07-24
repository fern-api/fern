# frozen_string_literal: true

module Unknown
    module Types
        class MyObject < Internal::Types::Model
            field :unknown, Object, optional: true, nullable: true
        end
    end
end
