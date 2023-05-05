# Fern Java Generators

## Custom Config

```yaml
  # Configures whether to generate unknown as Optional<Object> or Object
  # Default: false
  unknown-as-optional: true
  
  # wrapped-aliases defaults false
  # Configures whether to generate wrapper types for each alias to increase type-safety.
  # For example if you have an alias `ResourceId: string` then if this is true, the generator will generate a ResourceId.java file. If false, it will just treat it as java.util.String. 
  # Default: false.
  wrapped-aliases: true
```
