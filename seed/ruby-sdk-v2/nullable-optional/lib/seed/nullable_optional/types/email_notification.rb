# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class EmailNotification < Internal::Types::Model
        field :email_address, -> { String }, optional: false, nullable: false
        field :subject, -> { String }, optional: false, nullable: false
        field :html_content, -> { String }, optional: true, nullable: false
      end
    end
  end
end
