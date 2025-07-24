# frozen_string_literal: true

module Commons
    module Types
        class Metadata < Internal::Types::Model
            field :id, String, optional: true, nullable: true
            field :data, Array, optional: true, nullable: true
            field :json_string, Array, optional: true, nullable: true
        end
    end
end
