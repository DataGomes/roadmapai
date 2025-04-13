import requests
import json

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:8080/api/health")
        print(f"Health check status code: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error connecting to health endpoint: {str(e)}")
        return False

def test_roadmap_endpoint():
    """Test the roadmap generation endpoint with a sample request"""
    try:
        # Sample business description
        data = {
            "description": "A tech startup creating AI-powered analytics for healthcare providers"
        }
        
        # Send request to the API
        print(f"Sending request with data: {data}")
        response = requests.post(
            "http://localhost:8080/api/generate-roadmap",
            json=data
        )
        
        # Print response details
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\nRoadmap topics generated successfully:")
            print(f"\nMARKET: {result.get('market', [])}")
            print(f"\nPRODUCT: {result.get('product', [])}")
            print(f"\nTECH: {result.get('tech', [])}")
            return True
        else:
            print(f"Error response: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error testing roadmap endpoint: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing API endpoints...")
    print("\n1. Testing health endpoint:")
    health_result = test_health_endpoint()
    
    print("\n2. Testing roadmap generation endpoint:")
    roadmap_result = test_roadmap_endpoint()
    
    # Summary
    print("\n--- Test Summary ---")
    print(f"Health endpoint: {'✅ PASSED' if health_result else '❌ FAILED'}")
    print(f"Roadmap endpoint: {'✅ PASSED' if roadmap_result else '❌ FAILED'}")