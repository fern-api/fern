# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class SmsStatusPayload < Internal::Types::Model
      field :message_sid, -> { String }, optional: false, nullable: false, api_name: "messageSid"

      field :status, -> { String }, optional: false, nullable: false
    end
  end
end
