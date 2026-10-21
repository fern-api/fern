# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Realtime
    module Types
      class SendEvent < Internal::Types::Model
        field :send_text, -> { String }, optional: false, nullable: false, api_name: "sendText"

        field :send_param, -> { Integer }, optional: false, nullable: false, api_name: "sendParam"
      end
    end
  end
end
