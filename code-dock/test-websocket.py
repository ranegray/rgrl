#!/usr/bin/env python3
"""
Simple test to debug WebSocket joint state flow
Run this while the Docker container is running
"""

import asyncio
import websockets
import json
import requests
import sys

async def simple_websocket_test():
    """Test basic WebSocket functionality"""
    uri = "ws://localhost:8080/ws"
    
    print("🔗 Connecting to WebSocket...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected!")
            
            # Listen for messages
            async def message_listener():
                try:
                    while True:
                        message = await websocket.recv()
                        print(f"📨 Raw message: {message}")
                        
                        try:
                            data = json.loads(message)
                            print(f"📋 Parsed: {data}")
                            
                            if data.get('type') == 'joint_state':
                                print(f"🤖 JOINT STATE FOUND: {data['data']}")
                                
                        except json.JSONDecodeError:
                            print(f"❌ Failed to parse JSON: {message}")
                            
                except websockets.exceptions.ConnectionClosed:
                    print("❌ WebSocket closed")
                except Exception as e:
                    print(f"❌ Listener error: {e}")
            
            # Start listening
            listener_task = asyncio.create_task(message_listener())
            
            # Wait a moment
            await asyncio.sleep(1)
            
            # Test 1: Simple execution
            print("\n🧪 Test 1: Simple Python execution")
            simple_code = 'print("Hello from Python!")'
            
            response = requests.post(
                "http://localhost:8080/execute",
                json={"code": simple_code, "stdin": "", "tests": None},
                timeout=10
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response: {response.json()}")
            
            await asyncio.sleep(2)
            
            # Test 2: Joint state test
            print("\n🤖 Test 2: Joint state execution")
            joint_code = '''
import json

# Simple joint state test
joints = {
    "base_to_shoulder": 0.5,
    "shoulder_to_upper_arm": -1.0,
    "upper_arm_to_lower_arm": 0.0,
    "lower_arm_to_wrist": 0.0,
    "wrist_to_gripper": 0.0
}

print("Before joint state...")
print(f"JOINT_STATE:{json.dumps(joints)}")
print("After joint state...")
'''
            
            response = requests.post(
                "http://localhost:8080/execute",
                json={"code": joint_code, "stdin": "", "tests": None},
                timeout=10
            )
            
            print(f"Response status: {response.status_code}")
            result = response.json()
            print(f"Exit code: {result.get('exit_code')}")
            print(f"Stdout: {result.get('stdout')}")
            print(f"Stderr: {result.get('stderr')}")
            
            # Wait for messages
            await asyncio.sleep(3)
            
            listener_task.cancel()
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")

def test_direct_execution():
    """Test direct execution without WebSocket"""
    print("\n🔧 Testing direct execution...")
    
    test_code = '''
import json
joints = {"test": 1.23}
print(f"JOINT_STATE:{json.dumps(joints)}")
print("Normal output")
'''
    
    try:
        response = requests.post(
            "http://localhost:8080/execute",
            json={"code": test_code, "stdin": "", "tests": None},
            timeout=10
        )
        
        result = response.json()
        print(f"✅ Direct execution result:")
        print(f"  Exit code: {result.get('exit_code')}")
        print(f"  Stdout: {repr(result.get('stdout'))}")
        print(f"  Stderr: {repr(result.get('stderr'))}")
        
        # Check if JOINT_STATE is in output
        stdout = result.get('stdout', '')
        if 'JOINT_STATE:' in stdout:
            print("✅ JOINT_STATE found in output!")
        else:
            print("❌ JOINT_STATE not found in output")
            
    except Exception as e:
        print(f"❌ Direct execution failed: {e}")

async def main():
    print("🧪 Simple WebSocket Debug Test")
    print("=" * 40)
    
    # Test health first
    try:
        response = requests.get("http://localhost:8080/health", timeout=5)
        print(f"✅ Health check: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test direct execution
    test_direct_execution()
    
    # Test WebSocket
    await simple_websocket_test()
    
    print("\n✅ Test complete!")

if __name__ == "__main__":
    asyncio.run(main())
