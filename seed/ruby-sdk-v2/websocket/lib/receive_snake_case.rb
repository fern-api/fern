# frozen_string_literal: true

module Realtime
    module Types
        class ReceiveSnakeCase < Internal::Types::Model
            field :receive_text, String, optional: true, nullable: true
            field :receive_int, Integer, optional: true, nullable: true
        end
    end
end
