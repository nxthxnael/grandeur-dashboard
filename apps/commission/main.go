package main

import (
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	port := ":50051"
	lis, err := net.Listen("tcp", port)
	if err != nil {
		fmt.Printf("Failed to listen on gRPC port 50051: %v\n", err)
		os.Exit(1)
	}

	s := grpc.NewServer()
	// Register reflection service for CLI testing
	reflection.Register(s)

	fmt.Printf("Grandeur DLRS Go Commission Engine listening on gRPC port %s\n", port)
	
	// Graceful shutdown handling
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := s.Serve(lis); err != nil {
			fmt.Printf("gRPC server execution failure: %v\n", err)
		}
	}()

	<-stop
	fmt.Println("Gracefully stopping Go Commission Engine...")
	s.GracefulStop()
	fmt.Println("Go Commission Engine stopped.")
}
