# frozen_string_literal: true

module Realtime
    module Types
        class SendSnakeCase < Internal::Types::Model
            field :send_text, String, optional: true, nullable: true
            field :send_param, Integer, optional: true, nullable: true
        end
    end
end
