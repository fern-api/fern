# frozen_string_literal: true

module Realtime
    module Types
        class SendEvent2 < Internal::Types::Model
            field :send_text_2, String, optional: true, nullable: true
            field :send_param_2, Boolean, optional: true, nullable: true
        end
    end
end
