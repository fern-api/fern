# frozen_string_literal: true

module Api
    module Types
        class SendResponse < Internal::Types::Model
            field :message, String, optional: true, nullable: true
            field :status, Integer, optional: true, nullable: true
            field :success, Array, optional: true, nullable: true
        end
    end
end
