configPath=$1

cd /spring-server-generator/spring-server-generator-"$VERSION"
java -cp spring-server-generator-"$VERSION".jar:lib/* \
  com.fern.java.spring.SpringGeneratorCli "$configPath"
