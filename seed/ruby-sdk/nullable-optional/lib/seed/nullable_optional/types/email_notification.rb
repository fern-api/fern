# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class EmailNotification < Internal::Types::Model
        field :email_address, -> { String }, optional: false, nullable: false, api_name: "emailAddress"
        field :subject, -> { String }, optional: false, nullable: false
        field :html_content, -> { String }, optional: true, nullable: false, api_name: "htmlContent"
      end
    end
  end
end
