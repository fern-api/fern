# frozen_string_literal: true

module Api
    module Types
        class BaseResource < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :related_resources, Array, optional: true, nullable: true
            field :memo, Memo, optional: true, nullable: true
        end
    end
end
