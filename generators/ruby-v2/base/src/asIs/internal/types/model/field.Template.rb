# frozen_string_literal: true
module <%= gem_namespace %>
  module Internal
    module Types
      class Model
        # Definition of a field on a model
        class Field
          SENSITIVE_FIELD_NAMES = %i[
            password secret token api_key apikey access_token refresh_token
            client_secret client_id credential bearer authorization
          ].freeze

          attr_reader :name, :type, :optional, :nullable, :api_name, :value, :default

          def initialize(name:, type:, optional: false, nullable: false, api_name: nil, value: nil, default: nil)
            @name = name.to_sym
            @type = type
            @optional = optional
            @nullable = nullable
            @api_name = api_name || name.to_s
            @value = value
            @default = default
          end

          def literal?
            !value.nil?
          end

          def sensitive?
            SENSITIVE_FIELD_NAMES.include?(@name) ||
              SENSITIVE_FIELD_NAMES.any? { |sensitive| @name.to_s.include?(sensitive.to_s) }
          end
        end
      end
    end
  end
end  