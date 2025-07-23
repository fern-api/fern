# frozen_string_literal: true

module Union
    module Types
        class Request < Internal::Types::Model
            field :union, Array, optional: true, nullable: true
        end
    end
end
