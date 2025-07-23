# frozen_string_literal: true

module Api
    module Types
        class StringResponse < Internal::Types::Model
            field :data, String, optional: true, nullable: true
        end
    end
end
