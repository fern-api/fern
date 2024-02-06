configPath=$1

cd /spring
java -cp spring.jar:lib/* com.fern.java.spring.Cli "$configPath"
