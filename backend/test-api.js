const fetch = require('node-fetch');

async function testStaffAPI() {
  try {
    console.log('🧪 Testing Staff API...');
    
    const response = await fetch('http://localhost:5000/api/staff');
    const data = await response.json();
    
    console.log('Staff API Response:', data);
    
    if (data.success && data.data) {
      console.log(`✅ Staff API working. Found ${data.data.length} staff members`);
    } else {
      console.log('❌ Staff API returned error:', data.message);
    }
  } catch (error) {
    console.error('❌ Staff API test failed:', error.message);
  }
}

testStaffAPI();