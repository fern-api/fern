# frozen_string_literal: true

module Seed
  module Realtime
    module Types
      class SendEvent2 < Internal::Types::Model
        field :send_text_2, -> { String }, optional: false, nullable: false, api_name: "sendText2"
        field :send_param_2, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "sendParam2"
      end
    end
  end
end
