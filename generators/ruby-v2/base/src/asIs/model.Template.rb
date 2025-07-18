# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Types
      class Model
        class << self
          # Define a field on this model
          def field(name, type, **options)
            field_definition = Field.new(
              name: name,
              type: type,
              optional: options[:optional] || false,
              nullable: options[:nullable] || false,
              api_name: options[:api_name],
              value: options[:value],
              default: options[:default]
            )
            
            fields[name.to_sym] = field_definition
            
            # Define getter method
            define_method(name) do
              instance_variable_get("@#{name}")
            end
            
            # Define setter method
            define_method("#{name}=") do |value|
              instance_variable_set("@#{name}", value)
            end
          end
          
          # Get all defined fields for this model
          def fields
            @fields ||= {}
          end
          
          # Create instance from hash
          def from_hash(hash)
            instance = new
            hash.each do |key, value|
              field_name = key.to_sym
              if fields.key?(field_name)
                field_def = fields[field_name]
                converted_value = convert_value(value, field_def.type)
                instance.send("#{field_name}=", converted_value)
              end
            end
            instance
          end
          
          # Convert a value to the appropriate type
          def convert_value(value, type)
            return nil if value.nil?
            
            case type.to_s
            when 'String'
              value.to_s
            when 'Integer'
              value.to_i
            when 'Float'
              value.to_f
            when 'Boolean'
              !!value
            when 'Array'
              Array(value)
            when 'Hash'
              value.is_a?(Hash) ? value : {}
            else
              value
            end
          end
        end
        
        def initialize(attributes = {})
          attributes.each do |key, value|
            field_name = key.to_sym
            if self.class.fields.key?(field_name)
              field_def = self.class.fields[field_name]
              converted_value = self.class.convert_value(value, field_def.type)
              send("#{field_name}=", converted_value)
            end
          end
        end
        
        # Convert model to hash representation
        def to_hash
          hash = {}
          self.class.fields.each do |field_name, field_def|
            value = send(field_name)
            next if value.nil? && field_def.optional
            
            api_key = field_def.api_name.to_s
            hash[api_key] = serialize_value(value)
          end
          hash
        end
        
        # Convert model to JSON
        def to_json(*args)
          to_hash.to_json(*args)
        end
        
        # Check if model is valid
        def valid?
          self.class.fields.all? do |field_name, field_def|
            value = send(field_name)
            
            # Check required fields
            if !field_def.optional && (value.nil? || (value.respond_to?(:empty?) && value.empty?))
              return false
            end
            
            # Check nullable fields
            if !field_def.nullable && value.nil?
              return false
            end
            
            true
          end
        end
        
        # Get validation errors
        def errors
          errors = []
          self.class.fields.each do |field_name, field_def|
            value = send(field_name)
            
            if !field_def.optional && (value.nil? || (value.respond_to?(:empty?) && value.empty?))
              errors << "#{field_name} is required"
            end
            
            if !field_def.nullable && value.nil?
              errors << "#{field_name} cannot be null"
            end
          end
          errors
        end
        
        # Compare models for equality
        def ==(other)
          return false unless other.is_a?(self.class)
          
          self.class.fields.all? do |field_name, _|
            send(field_name) == other.send(field_name)
          end
        end
        
        # String representation
        def inspect
          field_values = self.class.fields.map do |field_name, _|
            value = send(field_name)
            "#{field_name}=#{value.inspect}"
          end.join(', ')
          
          "#<#{self.class.name}:#{object_id} #{field_values}>"
        end
        
        alias_method :to_s, :inspect
        
        private
        
        # Serialize a value for hash/JSON conversion
        def serialize_value(value)
          case value
          when Model
            value.to_hash
          when Array
            value.map { |v| serialize_value(v) }
          when Hash
            value.transform_values { |v| serialize_value(v) }
          else
            value
          end
        end
      end
    end
  end
end 