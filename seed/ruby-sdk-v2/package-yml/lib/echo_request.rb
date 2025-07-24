# frozen_string_literal: true

module Api
    module Types
        class EchoRequest < Internal::Types::Model
            field :name, String, optional: true, nullable: true
            field :size, Integer, optional: true, nullable: true
        end
    end
end
