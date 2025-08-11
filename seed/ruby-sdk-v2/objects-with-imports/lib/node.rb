# frozen_string_literal: true

module Api
    module Types
        class Node < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :label, Array, optional: true, nullable: true
            field :metadata, Array, optional: true, nullable: true
        end
    end
end
